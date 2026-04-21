import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;

@service({
  title: "Booking API",
  version: "1.0.0",
})
@doc("API для системы бронирования временных слотов. Разделён на две группы: /admin (для владельца) и /guest (для гостей).")
namespace BookingApi;

// ==================== MODELS ====================

@doc("Тип события — шаблон бронирования с фиксированной длительностью")
model EventType {
  @doc("Уникальный идентификатор типа события (UUID)")
  id: string;

  @doc("Название типа события")
  name: string;

  @doc("Подробное описание типа события")
  description: string;

  @doc("Длительность события в минутах. Определяет размер временного слота.")
  durationMinutes: int32;
}

@doc("Публичное представление типа события — только поля, видимые гостям")
model EventTypePublic {
  @doc("Уникальный идентификатор типа события (UUID)")
  id: string;

  @doc("Название типа события")
  name: string;

  @doc("Подробное описание типа события")
  description: string;

  @doc("Длительность события в минутах")
  durationMinutes: int32;
}

@doc("Данные для создания или обновления типа события")
model EventTypeInput {
  @doc("Название типа события")
  name: string;

  @doc("Подробное описание типа события")
  description: string;

  @doc("Длительность события в минутах. Должна быть положительным числом.")
  durationMinutes: int32;
}

@doc("Временной слот для бронирования")
model Slot {
  @doc("Время начала слота в формате ISO 8601 (UTC)")
  startTime: utcDateTime;

  @doc("Время окончания слота в формате ISO 8601 (UTC). Вычисляется как startTime + durationMinutes типа события.")
  endTime: utcDateTime;

  @doc("Признак доступности слота: true — свободен, false — занят")
  available: boolean;
}

@doc("Бронирование временного слота")
model Booking {
  @doc("Уникальный идентификатор бронирования (UUID)")
  id: string;

  @doc("Идентификатор типа события, для которого создано бронирование")
  eventTypeId: string;

  @doc("Имя гостя (необязательно)")
  guestName?: string;

  @doc("Email гостя (необязательно)")
  guestEmail?: string;

  @doc("Время начала бронирования в формате ISO 8601 (UTC)")
  startTime: utcDateTime;

  @doc("Время создания записи о бронировании в формате ISO 8601 (UTC)")
  createdAt: utcDateTime;
}

@doc("Данные для создания нового бронирования")
model BookingInput {
  @doc("Идентификатор типа события")
  eventTypeId: string;

  @doc("Желаемое время начала бронирования в формате ISO 8601 (UTC). Должно попадать в свободный слот в пределах ближайших 14 дней.")
  startTime: utcDateTime;

  @doc("Имя гостя (необязательно)")
  guestName?: string;

  @doc("Email гостя (необязательно)")
  guestEmail?: string;
}

@doc("Ответ с описанием ошибки")
@error
model ErrorResponse {
  @doc("Краткое сообщение об ошибке")
  message: string;

  @doc("Дополнительные детали ошибки (необязательно)")
  details?: string;
}

// ==================== ADMIN ROUTES ====================

@route("/admin")
@doc("Эндпоинты для владельца. Авторизация не требуется — доступ защищён только URL-префиксом /admin.")
namespace Admin {

  @route("/event-types")
  @doc("Управление типами событий")
  interface EventTypes {

    @get
    @doc("Получить список всех типов событий. Возвращает полные данные включая id.")
    list(): {
      @statusCode statusCode: 200;
      @body body: EventType[];
    };

    @post
    @doc("Создать новый тип события.")
    create(@body body: EventTypeInput):
      | {
          @statusCode statusCode: 201;
          @body body: EventType;
        }
      | {
          @statusCode statusCode: 400;
          @body body: ErrorResponse;
        };

    @get
    @route("/{id}")
    @doc("Получить тип события по его идентификатору.")
    read(@path @doc("UUID типа события") id: string):
      | {
          @statusCode statusCode: 200;
          @body body: EventType;
        }
      | {
          @statusCode statusCode: 404;
          @body body: ErrorResponse;
        };

    @put
    @route("/{id}")
    @doc("Обновить существующий тип события по его идентификатору.")
    update(
      @path @doc("UUID типа события") id: string,
      @body body: EventTypeInput,
    ):
      | {
          @statusCode statusCode: 200;
          @body body: EventType;
        }
      | {
          @statusCode statusCode: 400;
          @body body: ErrorResponse;
        }
      | {
          @statusCode statusCode: 404;
          @body body: ErrorResponse;
        };

    @delete
    @route("/{id}")
    @doc("Удалить тип события по его идентификатору. Возвращает пустой ответ при успехе.")
    delete(@path @doc("UUID типа события") id: string):
      | {
          @statusCode statusCode: 204;
        }
      | {
          @statusCode statusCode: 404;
          @body body: ErrorResponse;
        };
  }

  @route("/bookings")
  @doc("Просмотр бронирований")
  interface Bookings {

    @get
    @doc("Получить список всех предстоящих бронирований по всем типам событий, отсортированных по времени начала (ascending).")
    list(): {
      @statusCode statusCode: 200;
      @body body: Booking[];
    };
  }
}

// ==================== GUEST ROUTES ====================

@route("/guest")
@doc("Публичные эндпоинты для неавторизованных гостей.")
namespace Guest {

  @route("/event-types")
  @doc("Просмотр типов событий и доступных слотов")
  interface EventTypes {

    @get
    @doc("Получить список всех доступных типов событий. Возвращает только публичные поля: название, описание, длительность.")
    list(): {
      @statusCode statusCode: 200;
      @body body: EventTypePublic[];
    };

    @get
    @route("/{id}/slots")
    @doc("Получить список временных слотов для выбранного типа события на ближайшие 14 дней. Возвращает только свободные слоты (available: true).")
    listSlots(@path @doc("UUID типа события") id: string):
      | {
          @statusCode statusCode: 200;
          @body body: Slot[];
        }
      | {
          @statusCode statusCode: 404;
          @body body: ErrorResponse;
        };
  }

  @route("/bookings")
  @doc("Создание бронирований")
  interface Bookings {

    @post
    @doc("""
      Создать новое бронирование на выбранный слот.

      Правила:
      - Время начала должно соответствовать началу свободного слота.
      - Слот должен находиться в пределах ближайших 14 дней от текущей даты.
      - На одно и то же время нельзя создать два бронирования (даже для разных типов событий).
      - 409 Conflict возвращается, если слот уже занят.
    """)
    create(@body body: BookingInput):
      | {
          @statusCode statusCode: 201;
          @body body: Booking;
        }
      | {
          @statusCode statusCode: 400;
          @body body: ErrorResponse;
        }
      | {
          @statusCode statusCode: 404;
          @body body: ErrorResponse;
        }
      | {
          @statusCode statusCode: 409;
          @body body: ErrorResponse;
        };
  }
}
