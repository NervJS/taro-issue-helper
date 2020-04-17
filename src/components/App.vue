<template>
<div id="app" class="app">
  <AppHeader :lang="$lang" @change-lang="setLang"/>

  <div class="container">
    <form class="main-form" @submit.prevent="generate">
      <FormIntro/>

      <div class="common-fields vue-ui-grid col-2 default-gap">
        <VueFormField
          :title="i18n('target-title')"
          class="first-row"
        >
          <VueSelect
            required
            v-model="target"
          >
            <VueSelectButton
              v-for="option of targets"
              :key="option.id"
              :value="option.id"
              :label="option.name"
            />
          </VueSelect>
        </VueFormField>

        <VueFormField
          :title="i18n('type-title')"
          class="first-row"
        >
          <VueGroup
            v-model="type"
            class="extend"
          >
            <VueGroupButton
              v-for="option of types"
              :key="option.id"
              :value="option.id"
            >
              {{ option.name }}
            </VueGroupButton>
          </VueGroup>
        </VueFormField>

        <VueFormField
          class="span-2"
          :title="i18n('title-title')"
        >
          <VueInput
            v-model="title"
            required
            autofocus
            @blur="findIssues"
          />
          <i18n
            slot="subtitle"
            id="title-title-subtitle"
            @click-modal="titleShow = true"
          />
          <template slot="subtitle">
            <div class="similar-issues" v-if="issues.length">
              {{ i18n('similar-issues') }}:

              <ul>
                <li v-for="issue in issues" :key="issue.id">
                  <a
                    class="issue"
                    :href="issue.html_url"
                    target="_blank"
                    rel="noreferrer"
                    tabindex="-1"
                  >
                    {{ issue.title }}
                  </a>
                </li>
              </ul>

              <p v-if="showIssueToggleControl">
                <span
                  v-if="!showingAllIssues"
                  role="button"
                  @click="showingAllIssues = true"
                >
                  {{ i18n('show-more') }}
                </span>
                <span
                  v-else
                  role="button"
                  @click="showingAllIssues = false"
                >
                  {{ i18n('show-less') }}
                </span>
              </p>
            </div>
          </template>
        </VueFormField>
      </div>

      <!-- content component -->
      <keep-alive>
        <component :is="type" ref="content" :repo="repo" :target="target"/>
      </keep-alive>

      <div class="form-actions">
        <VueButton
          type="submit"
          class="primary big"
          :label="i18n('preview')"
        />
      </div>
    </form>

    <VueModal
      v-if="show"
      :title="i18n('preview-title')"
      class="medium"
      @close="show = false"
    >
      <div class="default-body" v-html="generated.html"/>

      <div slot="footer" class="actions">
        <VueButton
          class="primary big"
          :label="i18n('create')"
          @click="create()"
        />
      </div>
    </VueModal>

    <VueModal
      v-if="titleShow"
      :title="i18n('simple-clear-title')"
      class="medium"
      @close="titleShow = false"
    >
      <div class="default-body">
        <i18n id="simple-clear-modal"/>
      </div>
    </VueModal>
  </div>

  <footer class="app-footer">
    <p>&hellip;</p>
    <small>
      Inspired by 
      <a href="https://github.com/vuejs/vue-issue-helper">Vue Issue Helper </a>
      &centerdot;
      Check out source on <a href="https://github.com/nervjs/taro-issue-helper">GitHub</a>
    </small>
  </footer>
</div>
</template>

<script lang="babel">
import { targets } from '../config'
import { getQuery, updateQuery } from '../helpers'

import FormIntro from './FormIntro.vue'
import AppHeader from './AppHeader.vue'
import BugReport from './BugReport.vue'
import FeatureRequest from './FeatureRequest.vue'
import search from '../mixins/github-search'

export default {
  name: 'App',

  mixins: [search],

  components: {
    FormIntro,
    AppHeader,
    BugReport,
    FeatureRequest
  },

  data () {
    return {
      title: '',
      generated: {
        markdown: '',
        html: ''
      },
      show: false,
      preview: false,
      repo: 'nervjs/taro',
      target: 'weapp',
      type: 'bug-report',
      targets,
      versions: {},
      titleShow: false
    }
  },

  computed: {
    types () {
      return this.$lang && [
        { id: 'bug-report', name: this.i18n('bug-report') },
        { id: 'feature-request', name: this.i18n('feature-request') }
      ]
    }
  },

  watch: {
    repo (value) {
      updateQuery({ repo: value })
    },

    type (value) {
      updateQuery({ type: value })
    },

    target () {
      //
    }
  },

  created () {
    const { repo, type } = getQuery()
    this.repo = repo || 'nervjs/taro'
    this.type = type || 'bug-report'
    this.checkSimpleTitle()
  },

  methods: {
    checkSimpleTitle () {
      this.titleShow = window.location.hash === `#simple-clear-title`
    },
    setLang (lang) {
      // eslint-disable-next-line no-console
      this.$lang = lang
      updateQuery({ lang })
    },

    findIssues () {
      this.issues = []
      if (this.title) {
        this.fetchIssues(this.title, { is: 'issue', repo: this.repo })
      }
    },

    generate () {
      this.generated = this.$refs.content.generate()
      this.show = true
    },

    create () {
      const title = encodeURIComponent(this.title).replace(/%2B/gi, '+')
      const body = encodeURIComponent(this.generated.markdown).replace(/%2B/gi, '+')
      const label = this.type === 'feature-request' ? '&labels=feature%20request' : ''
      window.open(`https://github.com/${this.repo}/issues/new?title=${title}&body=${body}${label}`)
    },
  },
}
</script>

<style lang="stylus">
@import '~@vue/ui/dist/vue-ui.css'
</style>

<style lang="stylus" scoped>
@import "../style/imports"

.container
  max-width $page-width
  margin 0 auto
  box-sizing border-box
  padding 0 24px

.first-row
  margin-bottom 24px

.common-fields
  margin-bottom 12px

.form-actions
  h-box()
  box-center()
  margin 24px 0

.app-footer
  text-align center
  margin 24px 0
</style>
