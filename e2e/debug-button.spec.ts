import { test, expect } from '@playwright/test'

test('кнопка Записаться переходит на страницу бронирования', async ({ page }) => {
  await page.goto('/')

  // Ждём загрузки карточек
  await expect(page.getByText('Test Meeting')).toBeVisible()

  // Кликаем кнопку
  await page.getByRole('button', { name: /Записаться/ }).click()

  // Ожидаем переход на страницу бронирования
  await expect(page).toHaveURL(/\/book\//)
  await expect(page.getByText('Календарь')).toBeVisible()
})
