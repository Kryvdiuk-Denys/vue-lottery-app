<template>
  <RouterLink class="brand-logo" :to="{ name: 'home' }" aria-label="Vue Lottery App home">
    <span class="brand-mark">V</span>
    <span class="brand-copy"><strong>Vue</strong> Lottery</span>
  </RouterLink>
</template>

<style scoped>
.brand-logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #253746;
  font-size: 18px;
  text-decoration: none;
}

.brand-mark {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 10px;
  background: #e8f8fa;
  color: #0aafc8;
  font-size: 22px;
  font-weight: 800;
}
</style>
