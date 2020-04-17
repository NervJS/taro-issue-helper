export default {
  watch: {
    show () {
    }
  },

  methods: {
    checkModal (id) {
      this.show = window.location.hash === `#${id}`
    }
  }
}
