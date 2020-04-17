export default {
  watch: {
    show () {
      // if (!val) {
      //   const newUrl = window.location.origin + '/' + window.location.search
      //   window.history.pushState({
      //     path: newUrl
      //   }, '', newUrl)
      // }
    }
  },

  methods: {
    checkModal (id) {
      this.show = window.location.hash === `#${id}`
    }
  }
}
