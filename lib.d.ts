declare module "lodash.debounce" {
    function debounce(func: () => void, wait: number): () => void;
    export = debounce;
}
