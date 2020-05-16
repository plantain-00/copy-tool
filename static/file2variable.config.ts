import { ConfigData } from 'file2variable-cli'

export default {
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
} as ConfigData
