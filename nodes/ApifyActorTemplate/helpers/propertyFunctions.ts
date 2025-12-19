import { INodeProperties } from 'n8n-workflow';

/**
 * Property definition for startUrls
 */
export function getStartUrlsProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Start URLs",
			"name": "startUrls",
			"description": "One or more URLs of pages where the crawler will start.\n\nBy default, the Actor will also crawl sub-pages of these URLs. For example, for start URL `https://example.com/blog`, it will crawl also `https://example.com/blog/post` or `https://example.com/blog/article`. The **Include URLs (globs)** option overrides this automation behavior.",
			"required": true,
			"default": {},
			"type": "fixedCollection",
			"typeOptions": {
					"multipleValues": true
			},
			"options": [
					{
							"name": "items",
							"displayName": "items",
							"values": [
									{
											"displayName": "item",
											"name": "url",
											"type": "string",
											"default": ""
									}
							]
					}
			]
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for useSitemaps
 */
export function getUseSitemapsProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Load URLs from Sitemaps",
			"name": "useSitemaps",
			"description": "If enabled, the crawler will look for [Sitemaps](https://en.wikipedia.org/wiki/Sitemaps) at the domains of the provided *Start URLs* and enqueue matching URLs similarly as the links found on crawled pages. You can also reference a `sitemap.xml` file directly by adding it as another Start URL (e.g. `https://www.example.com/sitemap.xml`)\n\nThis feature makes the crawling more robust on websites that support Sitemaps, as it includes pages that might be not reachable from Start URLs. However, **loading and processing Sitemaps can take a lot of time, especially for large sites**. Note that if a page is found via Sitemaps, it will have `depth` of `1`.",
			"required": false,
			"default": false,
			"type": "boolean"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for useLlmsTxt
 */
export function getUseLlmsTxtProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Crawl /llms.txt and Markdown files",
			"name": "useLlmsTxt",
			"description": "If enabled, the crawler will look for `/llms.txt` files at the root of the domains of the provided Start URLs (e.g., `https://example.com/llms.txt`) and enqueue them for crawling. Note that this also enables crawling other Markdown files and enqueueing links from them.",
			"required": false,
			"default": false,
			"type": "boolean"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for respectRobotsTxtFile
 */
export function getRespectRobotsTxtFileProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Respect the robots.txt file",
			"name": "respectRobotsTxtFile",
			"description": "If enabled, the crawler will consult the robots.txt file for the target website before crawling each page. At the moment, the crawler does not use any specific user agent identifier. The crawl-delay directive is also not supported yet.",
			"required": false,
			"default": false,
			"type": "boolean"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for crawlerType
 */
export function getCrawlerTypeProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Crawler type",
			"name": "crawlerType",
			"description": "Select the crawling engine:\n- **Adaptive switching** between browser and raw HTTP: Fast and renders JavaScript content if present. Default and recommended option.\n- **Headless browser** (Firefox+Playwright): Reliable, renders JavaScript content, best in avoiding blocking, but might be slow.\n- **Raw HTTP client** (Cheerio): Fastest, but doesn't render JavaScript content.\n- **Raw HTTP client with JavaScript** (JSDOM): Deprecated, use Cheerio instead.\n- **Headless browser** (Chrome+Playwright): Deprecated, use Firefox+Playwright instead.\n\nMore details about Crawler types are in [readme](https://console.apify.com/actors/aYG0l9s7dbB7j3gbS/information/version-0/readme#crawler-types).",
			"required": false,
			"default": "playwright:firefox",
			"type": "options",
			"options": [
					{
							"name": "Adaptive switching between browser and raw HTTP. Recommended.",
							"value": "playwright:adaptive"
					},
					{
							"name": "Headless browser (Firefox+Playwright)",
							"value": "playwright:firefox"
					},
					{
							"name": "Raw HTTP client (Cheerio)",
							"value": "cheerio"
					},
					{
							"name": "[DEPRECATED] Raw HTTP client with JavaScript (JSDOM) - This crawler will use Cheerio instead.",
							"value": "jsdom"
					},
					{
							"name": "[DEPRECATED] Headless browser (Chrome+Playwright) - The crawler will use Firefox+Playwright instead.",
							"value": "playwright:chrome"
					}
			]
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for includeUrlGlobs
 */
export function getIncludeUrlGlobsProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Include URLs (globs)",
			"name": "includeUrlGlobs",
			"description": "Glob patterns matching URLs of pages that will be included in crawling. \n\nSetting this option will disable the default Start URLs based scoping and will allow you to customize the crawling scope yourself. Note that this affects only links found on pages, but not **Start URLs** - if you want to crawl a page, make sure to specify its URL in the **Start URLs** field. \n\nFor example `https://{store,docs}.example.com/**` lets the crawler to access all URLs starting with `https://store.example.com/` or `https://docs.example.com/`, and `https://example.com/**/*\\?*foo=*` allows the crawler to access all URLs that contain `foo` query parameter with any value.\n\nLearn more about globs and test them [here](https://www.digitalocean.com/community/tools/glob?comments=true&glob=https%3A%2F%2Fexample.com%2Fscrape_this%2F%2A%2A&matches=false&tests=https%3A%2F%2Fexample.com%2Ftools%2F&tests=https%3A%2F%2Fexample.com%2Fscrape_this%2F&tests=https%3A%2F%2Fexample.com%2Fscrape_this%2F123%3Ftest%3Dabc&tests=https%3A%2F%2Fexample.com%2Fdont_scrape_this).",
			"required": false,
			"default": "[]",
			"type": "json"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for excludeUrlGlobs
 */
export function getExcludeUrlGlobsProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Exclude URLs (globs)",
			"name": "excludeUrlGlobs",
			"description": "Glob patterns matching URLs of pages that will be excluded from crawling. Note that this affects only links found on pages, but not **Start URLs**, which are always crawled. \n\nFor example `https://{store,docs}.example.com/**` excludes all URLs starting with `https://store.example.com/` or `https://docs.example.com/`, and `https://example.com/**/*\\?*foo=*` excludes all URLs that contain `foo` query parameter with any value.\n\nLearn more about globs and test them [here](https://www.digitalocean.com/community/tools/glob?comments=true&glob=https%3A%2F%2Fexample.com%2Fdont_scrape_this%2F%2A%2A&matches=false&tests=https%3A%2F%2Fexample.com%2Ftools%2F&tests=https%3A%2F%2Fexample.com%2Fdont_scrape_this%2F&tests=https%3A%2F%2Fexample.com%2Fdont_scrape_this%2F123%3Ftest%3Dabc&tests=https%3A%2F%2Fexample.com%2Fscrape_this).",
			"required": false,
			"default": "[]",
			"type": "json"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for keepUrlFragments
 */
export function getKeepUrlFragmentsProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "URL #fragments identify unique pages",
			"name": "keepUrlFragments",
			"description": "Indicates that URL fragments (e.g. <code>http://example.com<b>#fragment</b></code>) should be included when checking whether a URL has already been visited or not. Typically, URL fragments are used for page navigation only and therefore they should be ignored, as they don't identify separate pages. However, some single-page websites use URL fragments to display different pages; in such a case, this option should be enabled.",
			"required": false,
			"default": false,
			"type": "boolean"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for ignoreCanonicalUrl
 */
export function getIgnoreCanonicalUrlProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Ignore canonical URLs",
			"name": "ignoreCanonicalUrl",
			"description": "If enabled, the Actor will ignore the canonical URL reported by the page, and use the actual URL instead. You can use this feature for websites that report invalid canonical URLs, which causes the Actor to skip those pages in results.",
			"required": false,
			"default": false,
			"type": "boolean"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for ignoreHttpsErrors
 */
export function getIgnoreHttpsErrorsProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Ignore HTTPS errors",
			"name": "ignoreHttpsErrors",
			"description": "If enabled, the scraper will ignore HTTPS certificate errors. Use at your own risk.",
			"required": false,
			"default": false,
			"type": "boolean"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for maxCrawlDepth
 */
export function getMaxCrawlDepthProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Max crawling depth",
			"name": "maxCrawlDepth",
			"description": "The maximum number of links starting from the start URL that the crawler will recursively follow. The start URLs have depth `0`, the pages linked directly from the start URLs have depth `1`, and so on.\n\nThis setting is useful to prevent accidental crawler runaway. By setting it to `0`, the Actor will only crawl the Start URLs.",
			"required": false,
			"default": 20,
			"type": "number",
			"typeOptions": {
					"minValue": 0
			}
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for maxCrawlPages
 */
export function getMaxCrawlPagesProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Max pages",
			"name": "maxCrawlPages",
			"description": "The maximum number pages to crawl. It includes the start URLs, pagination pages, pages with no content, etc. The crawler will automatically finish after reaching this number. This setting is useful to prevent accidental crawler runaway.",
			"required": false,
			"default": 9999999,
			"type": "number",
			"typeOptions": {
					"minValue": 0
			}
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for initialConcurrency
 */
export function getInitialConcurrencyProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Initial concurrency",
			"name": "initialConcurrency",
			"description": "The initial number of web browsers or HTTP clients running in parallel. The system scales the concurrency up and down based on the current CPU and memory load. If the value is set to 0 (default), the Actor uses the default setting for the specific crawler type.\n\nNote that if you set this value too high, the Actor will run out of memory and crash. If too low, it will be slow at start before it scales the concurrency up.",
			"required": false,
			"default": 0,
			"type": "number",
			"typeOptions": {
					"minValue": 0,
					"maxValue": 999
			}
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for maxConcurrency
 */
export function getMaxConcurrencyProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Max concurrency",
			"name": "maxConcurrency",
			"description": "The maximum number of web browsers or HTTP clients running in parallel. This setting is useful to avoid overloading the target websites and to avoid getting blocked.",
			"required": false,
			"default": 200,
			"type": "number",
			"typeOptions": {
					"minValue": 1,
					"maxValue": 999
			}
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for initialCookies
 */
export function getInitialCookiesProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Initial cookies",
			"name": "initialCookies",
			"description": "Cookies that will be pre-set to all pages the scraper opens. This is useful for pages that require login. The value is expected to be a JSON array of objects with `name` and `value` properties. For example: `[{\"name\": \"cookieName\", \"value\": \"cookieValue\"}]`.\n\nYou can use the [EditThisCookie](https://docs.apify.com/academy/tools/edit-this-cookie) browser extension to copy browser cookies in this format, and paste it here.\n\nNote that the value is secret and encrypted to protect your login cookies.",
			"required": false,
			"default": [],
			"type": "json"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for customHttpHeaders
 */
export function getCustomHttpHeadersProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Custom HTTP headers",
			"name": "customHttpHeaders",
			"description": "HTTP headers that will be added to all requests made by the crawler. This is useful for setting custom authentication headers or other headers required by the target website. The value is expected to be a JSON object with `name` and `value` properties. For example: `{ \"name\": \"Authorization\", \"value\": \"Basic a1b2c3d4...\" }`.",
			"required": false,
			"default": "{}",
			"type": "json"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for signHttpRequests
 */
export function getSignHttpRequestsProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Sign HTTP requests (experimental)",
			"name": "signHttpRequests",
			"description": "If enabled, the crawler will sign all HTTP requests using its Web Bot Auth private key. This is necessary if you want to use Website Content Crawler as a Cloudflare Signed Agent.",
			"required": false,
			"default": false,
			"type": "boolean"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for pageFunction
 */
export function getPageFunctionProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Page function",
			"name": "pageFunction",
			"description": "A declaration of an asynchronous JS function (e.g. `async function pageFunction({ page }) { await page.click('.submit-button') }`).\n\nThe function receives `context` as the only argument. Context is a JavaScript object containing the following properties:\n- `page`: Currently loaded Playwright `Page` instance.\n- `request`: The request object that triggered the page load.\n\nThe function will be executed in the browser context for each crawled page, after the page is loaded (included all dynamic content) and before the content is extracted and cleaned.",
			"required": false,
			"default": "",
			"type": "string"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for proxyConfiguration
 */
export function getProxyConfigurationProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Proxy configuration",
			"name": "proxyConfiguration",
			"description": "Enables loading the websites from IP addresses in specific geographies and to circumvent blocking.",
			"required": true,
			"default": "{\"useApifyProxy\":true}",
			"type": "json"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for maxSessionRotations
 */
export function getMaxSessionRotationsProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Maximum number of session rotations",
			"name": "maxSessionRotations",
			"description": "The maximum number of times the crawler will rotate the session (IP address + browser configuration) on anti-scraping measures like CAPTCHAs. If the crawler rotates the session more than this number and the page is still blocked, it will finish with an error.",
			"required": false,
			"default": 10,
			"type": "number",
			"typeOptions": {
					"minValue": 0,
					"maxValue": 20
			}
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for maxRequestRetries
 */
export function getMaxRequestRetriesProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Maximum number of retries on network / server errors",
			"name": "maxRequestRetries",
			"description": "The maximum number of times the crawler will retry the request on network, proxy or server errors. If the (n+1)-th request still fails, the crawler will mark this request as failed.",
			"required": false,
			"default": 3,
			"type": "number",
			"typeOptions": {
					"minValue": 0,
					"maxValue": 20
			}
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for requestTimeoutSecs
 */
export function getRequestTimeoutSecsProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Request timeout",
			"name": "requestTimeoutSecs",
			"description": "Timeout in seconds for making the request and processing its response. Defaults to 60s.",
			"required": false,
			"default": 60,
			"type": "number",
			"typeOptions": {
					"minValue": 1,
					"maxValue": 600
			}
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for minFileDownloadSpeedKBps
 */
export function getMinFileDownloadSpeedKBpsProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Minimum file download speed",
			"name": "minFileDownloadSpeedKBps",
			"description": "The minimum viable file download speed in kilobytes per seconds. If the file download speed is lower than this value for a prolonged duration, the crawler will consider the file download as failing, abort it, and retry it again (up to \"Maximum number of retries\" times). This is useful to avoid your crawls being stuck on slow file downloads.",
			"required": false,
			"default": 128,
			"type": "number",
			"typeOptions": {}
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for dynamicContentWaitSecs
 */
export function getDynamicContentWaitSecsProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Wait for dynamic content",
			"name": "dynamicContentWaitSecs",
			"description": "The maximum time in seconds to wait for dynamic page content to load. By default, it is 10 seconds. The crawler will continue processing the page either if this time elapses, or if it detects the network became idle as there are no more requests for additional resources.\n\nWhen using the **Wait for selector** option, the crawler will wait for the selector to appear for this amount of time. If the selector doesn't appear within this period, the request will fail and will be retried.\n\nNote that this setting is ignored for the raw HTTP client, because it doesn't execute JavaScript or loads any dynamic resources. Similarly, if the value is set to `0`, the crawler doesn't wait for any dynamic to load and processes the HTML as provided on load.",
			"required": false,
			"default": 10,
			"type": "number",
			"typeOptions": {}
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for waitForSelector
 */
export function getWaitForSelectorProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Wait for selector",
			"name": "waitForSelector",
			"description": "If set, the crawler will wait for the specified CSS selector to appear in the page before proceeding with the content extraction. This is useful for pages for which the default content load recognition by idle network fails. Setting this option completely disables the default behavior, and the page will be processed only if the element specified by this selector appears. If the element doesn't appear within the **Wait for dynamic content** timeout, the request will fail and will be retried later. The value must be a valid CSS selector as accepted by the `document.querySelectorAll()` function.\n\nWith the raw HTTP client, this option checks for the presence of the selector in the HTML content and throws an error if it's not found.",
			"required": false,
			"default": "",
			"type": "string"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for softWaitForSelector
 */
export function getSoftWaitForSelectorProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Soft wait for selector",
			"name": "softWaitForSelector",
			"description": "If set, the crawler will wait for the specified CSS selector to appear in the page before proceeding with the content extraction. Unlike the `waitForSelector` option, this option doesn't fail the request if the selector doesn't appear within the timeout (the request processing will continue).",
			"required": false,
			"default": "",
			"type": "string"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for maxScrollHeightPixels
 */
export function getMaxScrollHeightPixelsProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Maximum scroll height",
			"name": "maxScrollHeightPixels",
			"description": "The crawler will scroll down the page until all content is loaded (and network becomes idle), or until this maximum scrolling height is reached. Setting this value to `0` disables scrolling altogether.\n\nNote that this setting is ignored for the raw HTTP client, because it doesn't execute JavaScript or loads any dynamic resources.",
			"required": false,
			"default": 5000,
			"type": "number",
			"typeOptions": {
					"minValue": 0
			}
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for keepElementsCssSelector
 */
export function getKeepElementsCssSelectorProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Keep HTML elements (CSS selector)",
			"name": "keepElementsCssSelector",
			"description": "An optional CSS selector matching HTML elements that should be preserved in the DOM. If provided, all HTML elements which are not matching the CSS selectors or their descendants are removed from the DOM. This is useful to extract only relevant page content. The value must be a valid CSS selector as accepted by the `document.querySelectorAll()` function. \n\nThis option runs before the `HTML transformer` option. If you are missing content in the output despite using this option, try disabling the `HTML transformer`.",
			"required": false,
			"default": "",
			"type": "string",
			"typeOptions": {
					"rows": 5
			}
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for removeElementsCssSelector
 */
export function getRemoveElementsCssSelectorProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Remove HTML elements (CSS selector)",
			"name": "removeElementsCssSelector",
			"description": "A CSS selector matching HTML elements that will be removed from the DOM, before converting it to text, Markdown, or saving as HTML. This is useful to skip irrelevant page content. The value must be a valid CSS selector as accepted by the `document.querySelectorAll()` function. \n\nBy default, the Actor removes common navigation elements, headers, footers, modals, scripts, and inline image. You can disable the removal by setting this value to some non-existent CSS selector like `dummy_keep_everything`.",
			"required": false,
			"default": "nav, footer, script, style, noscript, svg, img[src^='data:'],\n[role=\"alert\"],\n[role=\"banner\"],\n[role=\"dialog\"],\n[role=\"alertdialog\"],\n[role=\"region\"][aria-label*=\"skip\" i],\n[aria-modal=\"true\"]",
			"type": "string",
			"typeOptions": {
					"rows": 5
			}
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for removeCookieWarnings
 */
export function getRemoveCookieWarningsProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Remove cookie warnings",
			"name": "removeCookieWarnings",
			"description": "If enabled, the Actor will try to remove cookies consent dialogs or modals, using the [I don't care about cookies](https://addons.mozilla.org/en-US/firefox/addon/i-dont-care-about-cookies/) browser extension, to improve the accuracy of the extracted text. Note that there is a small performance penalty if this feature is enabled.\n\nThis setting is ignored when using the raw HTTP crawler type.",
			"required": false,
			"default": true,
			"type": "boolean"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for blockMedia
 */
export function getBlockMediaProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Block loading of images and videos",
			"name": "blockMedia",
			"description": "If the flag is enabled and the Actor is using a headless browser, it will not load images, fonts, stylesheets and videos to improve performance. It will load scripts as usual - that is after all the point of using a headless browser.",
			"required": false,
			"default": false,
			"type": "boolean"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for expandIframes
 */
export function getExpandIframesProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Expand iframe elements",
			"name": "expandIframes",
			"description": "By default, the Actor will extract content from `iframe` elements. If you want to specifically skip `iframe` processing, disable this option. Works only for the `playwright:firefox` crawler type.",
			"required": false,
			"default": true,
			"type": "boolean"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for clickElementsCssSelector
 */
export function getClickElementsCssSelectorProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Expand clickable elements",
			"name": "clickElementsCssSelector",
			"description": "A CSS selector matching DOM elements that will be clicked. This is useful for expanding collapsed sections, in order to capture their text content. The value must be a valid CSS selector as accepted by the `document.querySelectorAll()` function. ",
			"required": false,
			"default": "[aria-expanded=\"false\"]",
			"type": "string"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for stickyContainerCssSelector
 */
export function getStickyContainerCssSelectorProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Make containers sticky",
			"name": "stickyContainerCssSelector",
			"description": "This is an **experimental** feature. A CSS selector matching DOM elements that will be prevented from deleting any of their children. This is useful in conjunction with the \"Expand clickable elements\" option on pages where hidden content is actually removed from the DOM (i.e., some variants of the accordion pattern). Enabling this might corrupt the extracted content, which is why it is disabled by default. It is possible to enable the feature for the whole page with the `*` selector, or you can target specific elements if the former has unwanted side effects.",
			"required": false,
			"default": "",
			"type": "string"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for htmlTransformer
 */
export function getHtmlTransformerProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "HTML transformer",
			"name": "htmlTransformer",
			"description": "Specify how to transform the HTML to extract meaningful content without any extra fluff, like navigation or modals. The HTML transformation happens after removing and clicking the DOM elements.\n\n- **Readable text with fallback** - Uses Mozilla's Readability to extract the main content but falls back to the original HTML if the page doesn't appear to be an article. This is useful for websites with mixed content types (articles, product pages, etc.) as it preserves more content on non-article pages.\n\n- **Readable text** (default) - Uses Mozilla's Readability to extract the main article content, removing navigation, headers, footers, and other non-essential elements. Works best for article-rich websites and blogs.\n\n- **Extractus** - Uses the Extractus article extraction library, which is an alternative content extraction algorithm. May work better than Readability on certain websites, particularly news sites or blogs with specific layouts.\n\n- **Defuddle** - Uses the Defuddle library. Defuddle is more forgiving than Readability, often preserving more uncertain elements and providing consistent output for footnotes, math, and code blocks. It also uses mobile styles to help identify unnecessary elements and extracts additional metadata such as schema.org data.\n\n- **None** - Only applies basic cleaning (removing elements specified via 'Remove HTML elements' option) without any content extraction algorithm. Best when you want to preserve most of the original HTML structure with minimal processing.\n\nYou can examine output of all transformers by enabling the debug mode.\n",
			"required": false,
			"default": "readableText",
			"type": "options",
			"options": [
					{
							"name": "Mozilla Readability with fallback",
							"value": "readableTextIfPossible"
					},
					{
							"name": "Mozilla Readability",
							"value": "readableText"
					},
					{
							"name": "Extractus",
							"value": "extractus"
					},
					{
							"name": "Defuddle",
							"value": "defuddle"
					},
					{
							"name": "None",
							"value": "none"
					}
			]
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for readableTextCharThreshold
 */
export function getReadableTextCharThresholdProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Readable text extractor character threshold",
			"name": "readableTextCharThreshold",
			"description": "A configuration options for the \"Readable text\" HTML transformer. It contains the minimum number of characters an article must have in order to be considered relevant.",
			"required": false,
			"default": 100,
			"type": "number",
			"typeOptions": {}
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for aggressivePrune
 */
export function getAggressivePruneProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Remove duplicate text lines",
			"name": "aggressivePrune",
			"description": "This is an **experimental feature**. If enabled, the crawler will prune content lines that are very similar to the ones already crawled on other pages, using the Count-Min Sketch algorithm. This is useful to strip repeating content in the scraped data like menus, headers, footers, etc. In some (not very likely) cases, it might remove relevant content from some pages.",
			"required": false,
			"default": false,
			"type": "boolean"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for debugMode
 */
export function getDebugModeProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Debug mode (stores output of all HTML transformers)",
			"name": "debugMode",
			"description": "If enabled, the Actor will store the output of all types of HTML transformers, including the ones that are not used by default, and it will also store the HTML to Key-value Store with a link. All this data is stored under the `debug` field in the resulting Dataset.",
			"required": false,
			"default": false,
			"type": "boolean"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for storeSkippedUrls
 */
export function getStoreSkippedUrlsProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Store skipped URLs",
			"name": "storeSkippedUrls",
			"description": "If enabled, the crawler will store all URLs that were skipped during the crawl in a Key-Value Store record named `SKIPPED_URLS`. The record will contain a JSON object with reasons for skipping and the URLs that were skipped for each reason. This is useful for debugging and understanding why certain pages were not crawled.",
			"required": false,
			"default": false,
			"type": "boolean"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for debugLog
 */
export function getDebugLogProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Debug log",
			"name": "debugLog",
			"description": "If enabled, the actor log will include debug messages. Beware that this can be quite verbose.",
			"required": false,
			"default": false,
			"type": "boolean"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for saveHtml
 */
export function getSaveHtmlProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Save HTML to dataset (deprecated)",
			"name": "saveHtml",
			"description": "If enabled, the crawler stores full transformed HTML of all pages found to the output dataset under the `html` field. **This option has been deprecated** in favor of the `saveHtmlAsFile` option, because the dataset records have a size of approximately 10MB and it's harder to review the HTML for debugging.",
			"required": false,
			"default": false,
			"type": "boolean"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for saveHtmlAsFile
 */
export function getSaveHtmlAsFileProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Save HTML to key-value store",
			"name": "saveHtmlAsFile",
			"description": "If enabled, the crawler stores full transformed HTML of all pages found to the default key-value store and saves links to the files as `htmlUrl` field in the output dataset. Storing HTML in key-value store is preferred to storing it into the dataset with the `saveHtml` option, because there's no size limit and it's easier for debugging as you can easily view the HTML.",
			"required": false,
			"default": false,
			"type": "boolean"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for saveMarkdown
 */
export function getSaveMarkdownProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Save Markdown",
			"name": "saveMarkdown",
			"description": "If enabled, the crawler converts the transformed HTML of all pages found to Markdown, and stores it under the `markdown` field in the output dataset.",
			"required": false,
			"default": true,
			"type": "boolean"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for saveFiles
 */
export function getSaveFilesProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Save files",
			"name": "saveFiles",
			"description": "If enabled, the crawler downloads files linked from the web pages, as long as their URL has one of the following file extensions: PDF, DOC, DOCX, XLS, XLSX, and CSV. Note that unlike web pages, the files are downloaded regardless if they are under **Start URLs** or not. The files are stored to the default key-value store, and metadata about them to the output dataset, similarly as for web pages.",
			"required": false,
			"default": false,
			"type": "boolean"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for saveScreenshots
 */
export function getSaveScreenshotsProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Save screenshots (headless browser only)",
			"name": "saveScreenshots",
			"description": "If enabled, the crawler stores a screenshot for each article page to the default key-value store. The link to the screenshot is stored under the `screenshotUrl` field in the output dataset. It is useful for debugging, but reduces performance and increases storage costs.\n\nNote that this feature only works with the `playwright:firefox` crawler type.",
			"required": false,
			"default": false,
			"type": "boolean"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for maxResults
 */
export function getMaxResultsProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Max results",
			"name": "maxResults",
			"description": "The maximum number of resulting web pages to store. The crawler will automatically finish after reaching this number. This setting is useful to prevent accidental crawler runaway. If both **Max pages** and **Max results** are defined, then the crawler will finish when the first limit is reached. Note that the crawler skips pages with the canonical URL of a page that has already been crawled, hence it might crawl more pages than there are results.",
			"required": false,
			"default": 9999999,
			"type": "number",
			"typeOptions": {
					"minValue": 0
			}
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for textExtractor
 */
export function getTextExtractorProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "Text extractor (deprecated)",
			"name": "textExtractor",
			"description": "Removed in favor of the `htmlTransformer` option. Will be removed soon.",
			"required": false,
			"default": "",
			"type": "string"
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for clientSideMinChangePercentage
 */
export function getClientSideMinChangePercentageProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "(Adaptive crawling only) Minimum client-side content change percentage",
			"name": "clientSideMinChangePercentage",
			"description": "The least amount of content (as a percentage) change after the initial load required to consider the pages client-side rendered",
			"required": false,
			"default": 15,
			"type": "number",
			"typeOptions": {
					"minValue": 1
			}
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}

/**
 * Property definition for renderingTypeDetectionPercentage
 */
export function getRenderingTypeDetectionPercentageProperty(resourceName: string, operationName: string): INodeProperties {
	return {

			"displayName": "(Adaptive crawling only) How often should the crawler attempt to detect page rendering type",
			"name": "renderingTypeDetectionPercentage",
			"description": "How often should the adaptive attempt to detect page rendering type",
			"required": false,
			"default": 10,
			"type": "number",
			"typeOptions": {
					"minValue": 1,
					"maxValue": 100
			}
	,
		displayOptions: {
			show: {
				resource: [resourceName],
				operation: [operationName],
			},
		},
	};
}
