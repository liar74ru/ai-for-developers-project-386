FROM php:8.4-cli

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    postgresql-client \
    libpq-dev \
    && docker-php-ext-install pdo_pgsql pgsql

COPY composer.lock composer.json ./
RUN composer install --no-dev --no-interaction --prefer-dist

COPY . .

RUN chmod -R 755 storage \
    && chmod -R 755 bootstrap/cache

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]