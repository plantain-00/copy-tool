import { ConfigData } from 'file2variable-cli'

const config: ConfigData = {
  base: 'static',
  files: [
    'static/app.template.html'
  ],
  handler: () => {
    return {
      type: 'vue3',
    }
  },
  out: 'static/variables.ts'
}

export default config
