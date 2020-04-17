<template>
  <nav class="app-header">
    <div class="container">
      <span class="brand" href="#" style="color: white">
        <img
          class="logo"
          src="https://taro-docs.jd.com/taro/img/logo-taro.png"
          alt="Taro's logo"
          height="24"
        >
        Issue Helper
      </span>

      <!-- <ul class="nav">
        <li
          v-for="(locale, key) in $root.$locales"
          :key="key"
          class="nav-item"
        >
          <a
            class="nav-link"
            :class="{ active: lang === key }"
            @click="$emit('change-lang', key)"
            v-if="key !== 'en'"
          >
            {{ locale._label }}
          </a>
        </li>
      </ul> -->
    </div>
  </nav>
</template>

<script>
export default {
  props: ['lang']
}
</script>

<style lang="stylus" scoped>
@import "../style/imports"

.app-header

  &,
  .container,
  .brand,
  .nav
    h-box()
    box-center()

  .container
    max-width $page-width
    flex 100% 1 1
    justify-content space-between
    padding 24px
    box-sizing border-box

  .brand
    color $vue-ui-color-dark
    .logo
      margin-right 8px

  .nav
    margin 0

  .nav-item
    list-style none
  .nav-item + .nav-item
    margin-left 8px

  .nav-link
    cursor default
    &:not(.active)
      cursor pointer
      color $vue-ui-color-dark

</style>
