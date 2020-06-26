import { ConfigData } from 'file2variable-cli'

const config: ConfigData = {
  base: 'static',
  files: [
    'static/app.template.html'
  ],
  /**
   * @argument {string} file
   */
  handler: (file: string) => {
    return {
      type: 'vue',
      name: 'App',
      path: './index'
    }
  },
  out: 'static/variables.ts'
}

export default config
