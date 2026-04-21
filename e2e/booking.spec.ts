import { test, expect } from '@playwright/test'

test.describe('Booking flow', () => {
  test('shows event types on home page', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Test Meeting')).toBeVisible()
    await expect(page.getByText('Тестовая встреча для e2e')).toBeVisible()
  })

  test('complete booking flow', async ({ page }) => {
    await page.goto('/')

    // Видим список типов событий
    await expect(page.getByText('Test Meeting')).toBeVisible()

    // Переходим на страницу бронирования
    await page.getByText('Test Meeting').click()
    await expect(page).toHaveURL(/\/book\//)
    await expect(page.getByText('Календарь')).toBeVisible()

    // Выбираем первую доступную дату (не disabled, только цифры)
    const availableDay = page
      .locator('button:not([disabled])')
      .filter({ hasText: /^\d+$/ })
      .first()
    await availableDay.click()

    // Выбираем первый свободный слот
    const freeSlot = page.locator('button').filter({ hasText: 'Свободно' }).first()
    await freeSlot.waitFor({ state: 'visible' })
    await freeSlot.click()

    // Заполняем форму
    await page.getByLabel('Ваше имя').fill('Test User')
    await page.getByLabel('Email').fill('test@example.com')

    // Отправляем
    await page.getByRole('button', { name: 'Продолжить' }).click()

    // Проверяем успех
    await expect(page.getByText('Забронировано!')).toBeVisible()
    await expect(page).toHaveURL('/')
  })
})
