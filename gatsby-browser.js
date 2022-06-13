/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */

// You can delete this file if you're not using it
import "./src/styles/site.css"
import "./src/layouts/layout.css"
import Amplify from 'aws-amplify'
import config from './src/aws-exports'
Amplify.configure(config)