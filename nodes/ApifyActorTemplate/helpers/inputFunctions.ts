import { IExecuteFunctions } from 'n8n-workflow';

/**
 * Get startUrls parameter (list)
 */
export function getStartUrls(this: IExecuteFunctions, i: number): {
	items?: { url: string }[];
} {
	const startUrls = this.getNodeParameter('startUrls', i, {}) as {
	items?: { url: string }[];
};
	return startUrls;
}

/**
 * Get useSitemaps parameter
 */
export function getUseSitemaps(this: IExecuteFunctions, i: number): boolean {
	const useSitemaps = this.getNodeParameter('useSitemaps', i) as boolean;
	return useSitemaps;
}

/**
 * Get useLlmsTxt parameter
 */
export function getUseLlmsTxt(this: IExecuteFunctions, i: number): boolean {
	const useLlmsTxt = this.getNodeParameter('useLlmsTxt', i) as boolean;
	return useLlmsTxt;
}

/**
 * Get respectRobotsTxtFile parameter
 */
export function getRespectRobotsTxtFile(this: IExecuteFunctions, i: number): boolean {
	const respectRobotsTxtFile = this.getNodeParameter('respectRobotsTxtFile', i) as boolean;
	return respectRobotsTxtFile;
}

/**
 * Get crawlerType parameter
 */
export function getCrawlerType(this: IExecuteFunctions, i: number): string {
	const crawlerType = this.getNodeParameter('crawlerType', i) as string;
	return crawlerType;
}

/**
 * Get includeUrlGlobs parameter
 */
export function getIncludeUrlGlobs(this: IExecuteFunctions, i: number): object | string {
	const includeUrlGlobs = this.getNodeParameter('includeUrlGlobs', i) as object | string;
	return includeUrlGlobs;
}

/**
 * Get excludeUrlGlobs parameter
 */
export function getExcludeUrlGlobs(this: IExecuteFunctions, i: number): object | string {
	const excludeUrlGlobs = this.getNodeParameter('excludeUrlGlobs', i) as object | string;
	return excludeUrlGlobs;
}

/**
 * Get keepUrlFragments parameter
 */
export function getKeepUrlFragments(this: IExecuteFunctions, i: number): boolean {
	const keepUrlFragments = this.getNodeParameter('keepUrlFragments', i) as boolean;
	return keepUrlFragments;
}

/**
 * Get ignoreCanonicalUrl parameter
 */
export function getIgnoreCanonicalUrl(this: IExecuteFunctions, i: number): boolean {
	const ignoreCanonicalUrl = this.getNodeParameter('ignoreCanonicalUrl', i) as boolean;
	return ignoreCanonicalUrl;
}

/**
 * Get ignoreHttpsErrors parameter
 */
export function getIgnoreHttpsErrors(this: IExecuteFunctions, i: number): boolean {
	const ignoreHttpsErrors = this.getNodeParameter('ignoreHttpsErrors', i) as boolean;
	return ignoreHttpsErrors;
}

/**
 * Get maxCrawlDepth parameter
 */
export function getMaxCrawlDepth(this: IExecuteFunctions, i: number): number {
	const maxCrawlDepth = this.getNodeParameter('maxCrawlDepth', i) as number;
	return maxCrawlDepth;
}

/**
 * Get maxCrawlPages parameter
 */
export function getMaxCrawlPages(this: IExecuteFunctions, i: number): number {
	const maxCrawlPages = this.getNodeParameter('maxCrawlPages', i) as number;
	return maxCrawlPages;
}

/**
 * Get initialConcurrency parameter
 */
export function getInitialConcurrency(this: IExecuteFunctions, i: number): number {
	const initialConcurrency = this.getNodeParameter('initialConcurrency', i) as number;
	return initialConcurrency;
}

/**
 * Get maxConcurrency parameter
 */
export function getMaxConcurrency(this: IExecuteFunctions, i: number): number {
	const maxConcurrency = this.getNodeParameter('maxConcurrency', i) as number;
	return maxConcurrency;
}

/**
 * Get initialCookies parameter
 */
export function getInitialCookies(this: IExecuteFunctions, i: number): object | string {
	const initialCookies = this.getNodeParameter('initialCookies', i) as object | string;
	return initialCookies;
}

/**
 * Get customHttpHeaders parameter
 */
export function getCustomHttpHeaders(this: IExecuteFunctions, i: number): object | string {
	const customHttpHeaders = this.getNodeParameter('customHttpHeaders', i) as object | string;
	return customHttpHeaders;
}

/**
 * Get signHttpRequests parameter
 */
export function getSignHttpRequests(this: IExecuteFunctions, i: number): boolean {
	const signHttpRequests = this.getNodeParameter('signHttpRequests', i) as boolean;
	return signHttpRequests;
}

/**
 * Get pageFunction parameter
 */
export function getPageFunction(this: IExecuteFunctions, i: number): string {
	const pageFunction = this.getNodeParameter('pageFunction', i) as string;
	return pageFunction;
}

/**
 * Get proxyConfiguration parameter
 */
export function getProxyConfiguration(this: IExecuteFunctions, i: number): object | string {
	const proxyConfiguration = this.getNodeParameter('proxyConfiguration', i) as object | string;
	return proxyConfiguration;
}

/**
 * Get maxSessionRotations parameter
 */
export function getMaxSessionRotations(this: IExecuteFunctions, i: number): number {
	const maxSessionRotations = this.getNodeParameter('maxSessionRotations', i) as number;
	return maxSessionRotations;
}

/**
 * Get maxRequestRetries parameter
 */
export function getMaxRequestRetries(this: IExecuteFunctions, i: number): number {
	const maxRequestRetries = this.getNodeParameter('maxRequestRetries', i) as number;
	return maxRequestRetries;
}

/**
 * Get requestTimeoutSecs parameter
 */
export function getRequestTimeoutSecs(this: IExecuteFunctions, i: number): number {
	const requestTimeoutSecs = this.getNodeParameter('requestTimeoutSecs', i) as number;
	return requestTimeoutSecs;
}

/**
 * Get minFileDownloadSpeedKBps parameter
 */
export function getMinFileDownloadSpeedKBps(this: IExecuteFunctions, i: number): number {
	const minFileDownloadSpeedKBps = this.getNodeParameter('minFileDownloadSpeedKBps', i) as number;
	return minFileDownloadSpeedKBps;
}

/**
 * Get dynamicContentWaitSecs parameter
 */
export function getDynamicContentWaitSecs(this: IExecuteFunctions, i: number): number {
	const dynamicContentWaitSecs = this.getNodeParameter('dynamicContentWaitSecs', i) as number;
	return dynamicContentWaitSecs;
}

/**
 * Get waitForSelector parameter
 */
export function getWaitForSelector(this: IExecuteFunctions, i: number): string {
	const waitForSelector = this.getNodeParameter('waitForSelector', i) as string;
	return waitForSelector;
}

/**
 * Get softWaitForSelector parameter
 */
export function getSoftWaitForSelector(this: IExecuteFunctions, i: number): string {
	const softWaitForSelector = this.getNodeParameter('softWaitForSelector', i) as string;
	return softWaitForSelector;
}

/**
 * Get maxScrollHeightPixels parameter
 */
export function getMaxScrollHeightPixels(this: IExecuteFunctions, i: number): number {
	const maxScrollHeightPixels = this.getNodeParameter('maxScrollHeightPixels', i) as number;
	return maxScrollHeightPixels;
}

/**
 * Get keepElementsCssSelector parameter
 */
export function getKeepElementsCssSelector(this: IExecuteFunctions, i: number): string {
	const keepElementsCssSelector = this.getNodeParameter('keepElementsCssSelector', i) as string;
	return keepElementsCssSelector;
}

/**
 * Get removeElementsCssSelector parameter
 */
export function getRemoveElementsCssSelector(this: IExecuteFunctions, i: number): string {
	const removeElementsCssSelector = this.getNodeParameter('removeElementsCssSelector', i) as string;
	return removeElementsCssSelector;
}

/**
 * Get removeCookieWarnings parameter
 */
export function getRemoveCookieWarnings(this: IExecuteFunctions, i: number): boolean {
	const removeCookieWarnings = this.getNodeParameter('removeCookieWarnings', i) as boolean;
	return removeCookieWarnings;
}

/**
 * Get blockMedia parameter
 */
export function getBlockMedia(this: IExecuteFunctions, i: number): boolean {
	const blockMedia = this.getNodeParameter('blockMedia', i) as boolean;
	return blockMedia;
}

/**
 * Get expandIframes parameter
 */
export function getExpandIframes(this: IExecuteFunctions, i: number): boolean {
	const expandIframes = this.getNodeParameter('expandIframes', i) as boolean;
	return expandIframes;
}

/**
 * Get clickElementsCssSelector parameter
 */
export function getClickElementsCssSelector(this: IExecuteFunctions, i: number): string {
	const clickElementsCssSelector = this.getNodeParameter('clickElementsCssSelector', i) as string;
	return clickElementsCssSelector;
}

/**
 * Get stickyContainerCssSelector parameter
 */
export function getStickyContainerCssSelector(this: IExecuteFunctions, i: number): string {
	const stickyContainerCssSelector = this.getNodeParameter('stickyContainerCssSelector', i) as string;
	return stickyContainerCssSelector;
}

/**
 * Get htmlTransformer parameter
 */
export function getHtmlTransformer(this: IExecuteFunctions, i: number): string {
	const htmlTransformer = this.getNodeParameter('htmlTransformer', i) as string;
	return htmlTransformer;
}

/**
 * Get readableTextCharThreshold parameter
 */
export function getReadableTextCharThreshold(this: IExecuteFunctions, i: number): number {
	const readableTextCharThreshold = this.getNodeParameter('readableTextCharThreshold', i) as number;
	return readableTextCharThreshold;
}

/**
 * Get aggressivePrune parameter
 */
export function getAggressivePrune(this: IExecuteFunctions, i: number): boolean {
	const aggressivePrune = this.getNodeParameter('aggressivePrune', i) as boolean;
	return aggressivePrune;
}

/**
 * Get debugMode parameter
 */
export function getDebugMode(this: IExecuteFunctions, i: number): boolean {
	const debugMode = this.getNodeParameter('debugMode', i) as boolean;
	return debugMode;
}

/**
 * Get storeSkippedUrls parameter
 */
export function getStoreSkippedUrls(this: IExecuteFunctions, i: number): boolean {
	const storeSkippedUrls = this.getNodeParameter('storeSkippedUrls', i) as boolean;
	return storeSkippedUrls;
}

/**
 * Get debugLog parameter
 */
export function getDebugLog(this: IExecuteFunctions, i: number): boolean {
	const debugLog = this.getNodeParameter('debugLog', i) as boolean;
	return debugLog;
}

/**
 * Get saveHtml parameter
 */
export function getSaveHtml(this: IExecuteFunctions, i: number): boolean {
	const saveHtml = this.getNodeParameter('saveHtml', i) as boolean;
	return saveHtml;
}

/**
 * Get saveHtmlAsFile parameter
 */
export function getSaveHtmlAsFile(this: IExecuteFunctions, i: number): boolean {
	const saveHtmlAsFile = this.getNodeParameter('saveHtmlAsFile', i) as boolean;
	return saveHtmlAsFile;
}

/**
 * Get saveMarkdown parameter
 */
export function getSaveMarkdown(this: IExecuteFunctions, i: number): boolean {
	const saveMarkdown = this.getNodeParameter('saveMarkdown', i) as boolean;
	return saveMarkdown;
}

/**
 * Get saveFiles parameter
 */
export function getSaveFiles(this: IExecuteFunctions, i: number): boolean {
	const saveFiles = this.getNodeParameter('saveFiles', i) as boolean;
	return saveFiles;
}

/**
 * Get saveScreenshots parameter
 */
export function getSaveScreenshots(this: IExecuteFunctions, i: number): boolean {
	const saveScreenshots = this.getNodeParameter('saveScreenshots', i) as boolean;
	return saveScreenshots;
}

/**
 * Get maxResults parameter
 */
export function getMaxResults(this: IExecuteFunctions, i: number): number {
	const maxResults = this.getNodeParameter('maxResults', i) as number;
	return maxResults;
}

/**
 * Get textExtractor parameter
 */
export function getTextExtractor(this: IExecuteFunctions, i: number): string {
	const textExtractor = this.getNodeParameter('textExtractor', i) as string;
	return textExtractor;
}

/**
 * Get clientSideMinChangePercentage parameter
 */
export function getClientSideMinChangePercentage(this: IExecuteFunctions, i: number): number {
	const clientSideMinChangePercentage = this.getNodeParameter('clientSideMinChangePercentage', i) as number;
	return clientSideMinChangePercentage;
}

/**
 * Get renderingTypeDetectionPercentage parameter
 */
export function getRenderingTypeDetectionPercentage(this: IExecuteFunctions, i: number): number {
	const renderingTypeDetectionPercentage = this.getNodeParameter('renderingTypeDetectionPercentage', i) as number;
	return renderingTypeDetectionPercentage;
}
