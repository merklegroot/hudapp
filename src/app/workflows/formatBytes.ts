export function formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];

    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}