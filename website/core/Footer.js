/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react')

const styles = {
  badgeWrapper: {
    textAlign: 'right',
  },
}

class Footer extends React.Component {
  docUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl
    const docsUrl = this.props.config.docsUrl
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`
    const langPart = `${language ? `${language}/` : ''}`

    return `${baseUrl}${docsPart}${langPart}${doc}`
  }

  pageUrl = (doc, language) => `${this.props.config.baseUrl}${language ? `${language}/` : ''}${doc}`

  render() {
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <a href={this.props.config.baseUrl} className="nav-home">
            {this.props.config.footerIcon && (
              <img
                src={this.props.config.baseUrl + this.props.config.footerIcon}
                alt={this.props.config.title}
                width="66"
                height="58"
              />
            )}
          </a>
          <div>
            <a href="https://github.com/erikengervall/fast-find-in-files">GitHub</a>
            <a
              className="github-button"
              href={this.props.config.repoUrl}
              data-icon="octicon-star"
              data-count-href="/erikengervall/fast-find-in-files"
              data-show-count="true"
              data-count-aria-label="# stargazers on GitHub"
              aria-label="Star this project on GitHub"
            >
              Star
            </a>
          </div>

          <div style={styles.badgeWrapper}>
            <img
              alt="licence"
              src="https://github.com/erikengervall/fast-find-in-files/workflows/Node.js%20CI/badge.svg"
            />

            <a href="https://www.npmjs.com/package/fast-find-in-files">
              <img alt="npm downloads" src="https://img.shields.io/npm/dm/fast-find-in-files.svg" />
            </a>

            <a href="https://github.com/erikengervall/fast-find-in-files/blob/master/LICENSE">
              <img alt="licence" src="https://img.shields.io/npm/l/fast-find-in-files.svg" />
            </a>

            <a href="https://www.npmjs.com/package/fast-find-in-files?activeTab=versions">
              <img alt="npm" src="https://img.shields.io/npm/v/fast-find-in-files" />
            </a>

            <a href="https://snyk.io/test/github/erikengervall/fast-find-in-files">
              <img alt="snyk" src="https://snyk.io/test/github/erikengervall/fast-find-in-files/badge.svg" />
            </a>
          </div>
        </section>

        <section className="copyright">{this.props.config.copyright}</section>
      </footer>
    )
  }
}

module.exports = Footer
