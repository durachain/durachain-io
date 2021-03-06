/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable jsx-a11y/html-has-lang */
import React from 'react';
import PropTypes from 'prop-types';

export default function HTML(props) {
  return (
    <html {...props.htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <script src="https://gw.alipayobjects.com/os/lib/react/16.6.3/umd/react.production.min.js" />
        <script src="https://gw.alipayobjects.com/os/lib/react-dom/16.6.3/umd/react-dom.production.min.js" />
        <script src="https://gw.alipayobjects.com/os/antv/pkg/_antv.data-set-0.8.9/dist/data-set.min.js" />
        <script src="https://gw.alipayobjects.com/os/lib/bizcharts/3.4.3/umd/BizCharts.min.js" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
          (function () {
            function isLocalStorageNameSupported() {
              var testKey = 'test';
              var storage = window.localStorage;
              try {
                storage.setItem(testKey, '1');
                storage.removeItem(testKey);
                return true;
              } catch (error) {
                return false;
              }
            }
            var pathname = location.pathname;
            function getLocalizedPathname(path, enUS) {
              var pathname = path.startsWith('/') ? path : '/' + path;
              if (enUS) { // to enUS
                '/';
              } else if (pathname === '/index') {
                return '/';
              } else if (pathname.endsWith('/index')) {
                return '/';
              }
              return pathname;
            }
            if (isLocalStorageNameSupported() && (pathname === '/' || pathname === '/index')) {
              var lang = (window.localStorage && localStorage.getItem('locale')) || (navigator.language.toLowerCase() === 'en-US');
              if ((lang === 'en-US')) {
                console.log(pathname)
                location.pathname = getLocalizedPathname(pathname, lang === 'en-US');
              }
            }
            document.documentElement.className += 'en-us';
          })()
          `,
          }}
        />
        {props.headComponents}
      </head>
      <body {...props.bodyAttributes}>
        {props.preBodyComponents}
        <noscript key="noscript" id="gatsby-noscript">
          This app works best with JavaScript enabled.
        </noscript>
        <div key="body" id="___gatsby" dangerouslySetInnerHTML={{ __html: props.body }} />
        {props.postBodyComponents}
      </body>
    </html>
  );
}

HTML.propTypes = {
  htmlAttributes: PropTypes.object,
  headComponents: PropTypes.array,
  bodyAttributes: PropTypes.object,
  preBodyComponents: PropTypes.array,
  body: PropTypes.string,
  postBodyComponents: PropTypes.array,
};
