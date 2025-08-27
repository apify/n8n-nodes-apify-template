import { INodeProperties } from 'n8n-workflow';

export const properties: INodeProperties[] = [
  {
    "displayName": "Search term or URL",
    "name": "query",
    "description": "Enter Google Search keywords or a URL of a specific web page. The keywords might include the [advanced search operators](https://blog.apify.com/how-to-scrape-google-like-a-pro/). Examples:\n\n- <code>san francisco weather</code>\n- <code>https://www.cnn.com</code>\n- <code>function calling site:openai.com</code>",
    "required": true,
    "default": "web browser for RAG pipelines -site:reddit.com",
    "type": "string",
    "displayOptions": {
      "show": {
        "operation": [
          "Run Actor Standard"
        ]
      }
    }
  },
  {
    "displayName": "Maximum results",
    "name": "maxResults",
    "description": "The maximum number of top organic Google Search results whose web pages will be extracted. If `query` is a URL, then this field is ignored and the Actor only fetches the specific web page.",
    "required": false,
    "default": 3,
    "type": "number",
    "typeOptions": {
      "minValue": 1,
      "maxValue": 100
    },
    "displayOptions": {
      "show": {
        "operation": [
          "Run Actor Standard"
        ]
      }
    }
  },
  {
    "displayName": "Output formats",
    "name": "outputFormats",
    "description": "Select one or more formats to which the target web pages will be extracted and saved in the resulting dataset.",
    "required": false,
    "default": [],
    "type": "multiOptions",
    "options": [
      {
        "name": "Plain text",
        "value": "text"
      },
      {
        "name": "Markdown",
        "value": "markdown"
      },
      {
        "name": "HTML",
        "value": "html"
      }
    ],
    "displayOptions": {
      "show": {
        "operation": [
          "Run Actor Standard"
        ]
      }
    }
  },
  {
    "displayName": "Request timeout",
    "name": "requestTimeoutSecs",
    "description": "The maximum time in seconds available for the request, including querying Google Search and scraping the target web pages. For example, OpenAI allows only [45 seconds](https://platform.openai.com/docs/actions/production#timeouts) for custom actions. If a target page loading and extraction exceeds this timeout, the corresponding page will be skipped in results to ensure at least some results are returned within the timeout. If no page is extracted within the timeout, the whole request fails.",
    "required": false,
    "default": 40,
    "type": "number",
    "typeOptions": {
      "minValue": 1,
      "maxValue": 300
    },
    "displayOptions": {
      "show": {
        "operation": [
          "Run Actor Standard"
        ]
      }
    }
  },
  {
    "displayName": "SERP proxy group",
    "name": "serpProxyGroup",
    "description": "Enables overriding the default Apify Proxy group used for fetching Google Search results.",
    "required": false,
    "default": "GOOGLE_SERP",
    "type": "options",
    "options": [
      {
        "name": "GOOGLE_SERP",
        "value": "GOOGLE_SERP"
      },
      {
        "name": "SHADER",
        "value": "SHADER"
      }
    ],
    "displayOptions": {
      "show": {
        "operation": [
          "Run Actor Standard"
        ]
      }
    }
  },
  {
    "displayName": "SERP max retries",
    "name": "serpMaxRetries",
    "description": "The maximum number of times the Actor will retry fetching the Google Search results on error. If the last attempt fails, the entire request fails.",
    "required": false,
    "default": 2,
    "type": "number",
    "typeOptions": {
      "minValue": 0,
      "maxValue": 5
    },
    "displayOptions": {
      "show": {
        "operation": [
          "Run Actor Standard"
        ]
      }
    }
  },
  {
    "displayName": "Proxy configuration",
    "name": "proxyConfiguration",
    "description": "Apify Proxy configuration used for scraping the target web pages.",
    "required": false,
    "default": "{\"useApifyProxy\":true}",
    "type": "json",
    "displayOptions": {
      "show": {
        "operation": [
          "Run Actor Standard"
        ]
      }
    }
  },
  {
    "displayName": "Select a scraping tool",
    "name": "scrapingTool",
    "description": "Select a scraping tool for extracting the target web pages. The Browser tool is more powerful and can handle JavaScript heavy websites, while the Plain HTML tool can't handle JavaScript but is about two times faster.",
    "required": false,
    "default": "raw-http",
    "type": "options",
    "options": [
      {
        "name": "Browser (uses Playwright)",
        "value": "browser-playwright"
      },
      {
        "name": "Raw HTTP",
        "value": "raw-http"
      }
    ],
    "displayOptions": {
      "show": {
        "operation": [
          "Run Actor Standard"
        ]
      }
    }
  },
  {
    "displayName": "Remove HTML elements (CSS selector)",
    "name": "removeElementsCssSelector",
    "description": "A CSS selector matching HTML elements that will be removed from the DOM, before converting it to text, Markdown, or saving as HTML. This is useful to skip irrelevant page content. The value must be a valid CSS selector as accepted by the `document.querySelectorAll()` function. \n\nBy default, the Actor removes common navigation elements, headers, footers, modals, scripts, and inline image. You can disable the removal by setting this value to some non-existent CSS selector like `dummy_keep_everything`.",
    "required": false,
    "default": "nav, footer, script, style, noscript, svg, img[src^='data:'],\n[role=\"alert\"],\n[role=\"banner\"],\n[role=\"dialog\"],\n[role=\"alertdialog\"],\n[role=\"region\"][aria-label*=\"skip\" i],\n[aria-modal=\"true\"]",
    "type": "string",
    "typeOptions": {
      "rows": 5
    },
    "displayOptions": {
      "show": {
        "operation": [
          "Run Actor Standard"
        ]
      }
    }
  },
  {
    "displayName": "HTML transformer",
    "name": "htmlTransformer",
    "description": "Specify how to transform the HTML to extract meaningful content without any extra fluff, like navigation or modals. The HTML transformation happens after removing and clicking the DOM elements.\n\n- **None** (default) - Only removes the HTML elements specified via 'Remove HTML elements' option.\n\n- **Readable text** - Extracts the main contents of the webpage, without navigation and other fluff.",
    "required": false,
    "default": "none",
    "type": "string",
    "displayOptions": {
      "show": {
        "operation": [
          "Run Actor Standard"
        ]
      }
    }
  },
  {
    "displayName": "Desired browsing concurrency",
    "name": "desiredConcurrency",
    "description": "The desired number of web browsers running in parallel. The system automatically scales the number based on the CPU and memory usage. If the initial value is `0`, the Actor picks the number automatically based on the available memory.",
    "required": false,
    "default": 5,
    "type": "number",
    "typeOptions": {
      "minValue": 0,
      "maxValue": 50
    },
    "displayOptions": {
      "show": {
        "operation": [
          "Run Actor Standard"
        ]
      }
    }
  },
  {
    "displayName": "Target page max retries",
    "name": "maxRequestRetries",
    "description": "The maximum number of times the Actor will retry loading the target web page on error. If the last attempt fails, the page will be skipped in the results.",
    "required": false,
    "default": 1,
    "type": "number",
    "typeOptions": {
      "minValue": 0,
      "maxValue": 3
    },
    "displayOptions": {
      "show": {
        "operation": [
          "Run Actor Standard"
        ]
      }
    }
  },
  {
    "displayName": "Target page dynamic content timeout",
    "name": "dynamicContentWaitSecs",
    "description": "The maximum time in seconds to wait for dynamic page content to load. The Actor considers the web page as fully loaded once this time elapses or when the network becomes idle.",
    "required": false,
    "default": 10,
    "type": "number",
    "typeOptions": {},
    "displayOptions": {
      "show": {
        "operation": [
          "Run Actor Standard"
        ]
      }
    }
  },
  {
    "displayName": "Remove cookie warnings",
    "name": "removeCookieWarnings",
    "description": "If enabled, the Actor attempts to close or remove cookie consent dialogs to improve the quality of extracted text. Note that this setting increases the latency.",
    "required": false,
    "default": true,
    "type": "boolean",
    "displayOptions": {
      "show": {
        "operation": [
          "Run Actor Standard"
        ]
      }
    }
  },
  {
    "displayName": "Enable debug mode",
    "name": "debugMode",
    "description": "If enabled, the Actor will store debugging information into the resulting dataset under the `debug` field.",
    "required": false,
    "default": false,
    "type": "boolean",
    "displayOptions": {
      "show": {
        "operation": [
          "Run Actor Standard"
        ]
      }
    }
  }
];
