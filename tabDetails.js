result = {
    'description': document.querySelector('meta[property~="og:description"]') && document.querySelector('meta[property~="og:description"]').content,
    'imageUrl': document.querySelector('meta[property~="og:image"]') && document.querySelector('meta[property~="og:image"]').content,
    'type': (document.querySelector('meta[property~="og:type"]') && document.querySelector('meta[property~="og:type"]').content) || 'undefined'
}
result