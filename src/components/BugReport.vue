<template>
  <div class="bug-report" style="margin:0">
    <div class="vue-ui-grid col-2 default-gap">
      <VueFormField
        :title="i18n('version-title')"
        :subtitle="i18n('version-subtitle')"
      >
        <VueTypeAhead
          v-model="attrs.version"
          :suggestions="suggestions"
          :loading="loadingVersion"
          show-all
          class="info"
          show-max="30"
          restrict-choice
          required
        />
      </VueFormField>

      <VueFormField
        :title="i18n('framework-title')"
      >
        <VueSelect
          required
          v-model="framework"
          :disabled="!isTaroNext"
        >
          <VueSelectButton
            v-for="option of frameworks"
            :key="option"
            :value="option"
            :label="option"
          />
        </VueSelect>
      </VueFormField>

      <VueFormField :title="i18n('repro-title')">
        <VueInput
          type="url"
          class="info"
          v-model="attrs.reproduction"
          :disabled="reproNotAvailable"
          required
        />

        <template slot="subtitle">
          <i18n
            id="repro-subtitle"
            @click-modal="show = true"
          />
          <VueSwitch  v-model="reproNotAvailable" class="info">
            <i18n id="cli-no-repro"/>
          </VueSwitch>
        </template>
      </VueFormField>

      <VueFormField
        v-if="targetType === 'h5'"
        :title="i18n('browser-and-os-title')"
      >
        <VueInput
          class="info"
          v-model="attrs.browserAndOS"
          required
        />

        <i18n
          slot="subtitle"
          id="browser-and-os-subtitle"
        />
      </VueFormField>

      <VueFormField
        v-if="targetType === 'mini'"
        :title="i18n('mini-version')"
      >
        <VueInput
          class="info"
          v-model="attrs.miniVersion"
          required
        />

        <i18n
          slot="subtitle"
          id="mini-version-subtitle"
        />
      </VueFormField>


      <VueFormField
        class="span-2"
        :title="i18n('steps-title')"
      >
        <VueInput
          class="info"
          type="textarea"
          rows="4"
          v-model="attrs.steps"
          required
        />
        <i18n slot="subtitle" id="steps-subtitle"/>
      </VueFormField>

      <VueFormField
        :title="i18n('expected-title')"
      >
        <VueInput
          type="textarea"
          rows="4"
          class="info"
          v-model="attrs.expected"
          required
        />
      </VueFormField>

      <VueFormField
        :title="i18n('actual-title')"
      >
        <VueInput
          class="info"
          type="textarea"
          rows="4"
          v-model="attrs.actual"
          required
        />
      </VueFormField>

      <VueFormField
        class="span-2"
        :title="i18n('cli-envinfo-title')"
      >
        <VueInput
          class="info"
          v-model="attrs.cliEnvInfo"
          type="textarea"
          rows="4"
          required
        />

        <i18n
          slot="subtitle"
          id="cli-envinfo-subtitle"
        />

        <div class="subtitle vue-ui-text danger" v-if="wrongCLIinfo">
          <div class="vue-ui-icon">
            <svg><use xlink:href="#ic_error_24px"></use></svg>
          </div>
          <span style="font-size: 14px">请补充准确的环境信息</span>
        </div>
      </VueFormField>

      <VueFormField
        class="span-2"
        :title="i18n('extra-title')"
        :subtitle="i18n('extra-subtitle')"
      >
        <VueInput
          class="info"
          type="textarea"
          rows="4"
          v-model="attrs.extra"
        />
      </VueFormField>
    </div>

    <VueModal
      v-if="show"
      :title="i18n('repro-modal-title')"
      class="medium"
      @close="show = false"
    >
      <div class="default-body">
        <i18n id="repro-modal"/>
      </div>
    </VueModal>
  </div>
</template>

<script>
import { targets } from '../config'
import { gt, lt, valid, gte } from 'semver'
import { generate } from '../helpers'
import modal from '../mixins/check-modal'

export default {
  props: ['repo', 'target'],

  mixins: [modal],

  data () {
    return {
      show: false,
      attrs: {
        version: '',
        reproduction: '',
        steps: '',
        expected: '',
        actual: '',
        extra: '',
        browserAndOS: '',
        nodeAndOS: '',
        cliEnvInfo: '',
        miniVersion: '',
        rnVersion: ''
      },
      framework: 'React',
      frameworks: ['React', 'Nerv', 'Vue 2', 'Vue 3'],
      versions: [],
      loadingVersion: false,
      reproNotAvailable: false
    }
  },

  computed: {
    suggestions () {
      return this.versions
        .slice()
        .sort((a, b) => gt(a.value, b.value) ? -1 : 1)
    },

    isTaroNext () {
      return this.attrs.version && valid(this.attrs.version) && gte(this.attrs.version, '3.0.0-alpha.0')
    },

    wrongCLIinfo () {
      const {
        cliEnvInfo
      } = this.attrs

      return cliEnvInfo && cliEnvInfo.indexOf('environment info:') === -1
    },

    isCLI () {
      return this.repo === 'vuejs/vue-cli'
    },

    doesNotSupportVueInfo () {
      return this.attrs.version && lt(this.attrs.version, '3.2.0')
    },

    targetType () {
      const minis = ['weapp', 'alipay', 'swan', 'qq', 'jd', 'quickapp']
      if (minis.indexOf(this.target) !== -1) {
        return 'mini'
      } else if (this.target === 'h5') {
        return 'h5'
      } else if (this.target === 'rn') {
        return 'rn'
      }

      return ''
    }
  },

  watch: {
    repo () {
      this.versions = []
      this.attrs.version = ''
      this.fetchVersions()
    }
  },

  created () {
    this.fetchVersions()
    this.checkModal('why-repro')
  },

  methods: {
    getTarget () {
      const target = targets.find(t => t.id === this.target)
      if (target) {
        return target.name
      }
      return '未找到平台，请手动修改。'
    },
    async fetchVersions (page = 1) {
      this.loadingVersion = true
      const repo = this.repo
      const response = await fetch(`https://api.github.com/repos/${repo}/tags?page=${page}&per_page=100`)
      const releases = await response.json()
      if (this.repo !== repo) return
      if (!releases || !(releases instanceof Array)) return false
      this.versions = this.versions.concat(releases.map(
        r => ({ value: /^v/.test(r.name) ? r.name.substr(1) : r.name })
      ).filter(p => valid(p.value) && !p.value.includes('experimental')))
      const link = response.headers.get('Link')
      if (link && link.indexOf('rel="next"') > -1) {
        await this.fetchVersions(page + 1)
      } else {
        this.loadingVersion = false
      }
      // set current version to the latest
      if (this.suggestions.length) {
        this.attrs.version = this.suggestions[0].value
      }
    },
    generate () {
      if (this.wrongCLIinfo) {
        return false
      }
      const {
        reproduction,
        steps,
        expected,
        actual,
        extra,
        browserAndOS,
        cliEnvInfo,
        miniVersion
      } = this.attrs

      return generate(`
### 相关平台
${this.getTarget()}

${reproduction ? `### 复现仓库
[${reproduction}](${reproduction})` : ``}
${browserAndOS ? `**浏览器版本: ${browserAndOS}**` : ``}${miniVersion ? `**小程序基础库: ${miniVersion}**` : ``}
${`**使用框架: ${this.isTaroNext ? 'React' : this.framework}**`}

### 复现步骤
${steps}

### 期望结果
${expected}

### 实际结果
${actual}

${cliEnvInfo ? `### 环境信息
\`\`\`
${cliEnvInfo}
\`\`\`
` : ``}

${extra ? `---
### 补充信息
${extra}` : ''}
  `.trim())
    }
  },
}
</script>
