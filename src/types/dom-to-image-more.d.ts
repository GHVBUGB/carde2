declare module 'dom-to-image-more' {
  interface Options {
    width?: number
    height?: number
    quality?: number
    backgroundColor?: string
    bgcolor?: string
    cacheBust?: boolean
    pixelRatio?: number
    skipAutoScale?: boolean
    imagePlaceholder?: string
    filter?: (node: HTMLElement) => boolean
    style?: Record<string, any>
  }

  function toPng(node: HTMLElement, options?: Options): Promise<string>
  function toJpeg(node: HTMLElement, options?: Options): Promise<string>
  function toBlob(node: HTMLElement, options?: Options): Promise<Blob>
  function toSvg(node: HTMLElement, options?: Options): Promise<string>

  export { toPng, toJpeg, toBlob, toSvg, Options }
  export default { toPng, toJpeg, toBlob, toSvg }
}
