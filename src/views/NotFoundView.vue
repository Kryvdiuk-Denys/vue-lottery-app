<template>
  <main class="content-page">
    <section class="content-card not-found-card">
      <p class="eyebrow">404 ERROR</p>
      <h1>Сторінку не знайдено</h1>
      <p>Перевірте адресу або поверніться на головну сторінку.</p>
      <RouterLink class="button-link" :to="{ name: 'home' }">На головну</RouterLink>
    </section>
  </main>
</template>
