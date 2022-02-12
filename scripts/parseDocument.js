const parseDocument = (data, url) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, "text/html");
    const errorNode = doc.querySelector('parsererror');
    let result;
    if (errorNode) {
        result = { 'message': 'fail' };
    } else {
        doc.querySelectorAll('img').forEach((i) => {
            let newSrc = new URL(i.getAttribute('src'), url).href;
            if (newSrc.includes('?'))
                newSrc = newSrc.slice(0, newSrc.indexOf('?'));
            i.src = newSrc;
            i.removeAttribute('srcset');
        });
        doc.querySelectorAll('a').forEach((a) => {
            a.href = new URL(a.getAttribute('href'), url).href;
        });
        doc.querySelectorAll('link').forEach((l) => {
            l.href = new URL(l.getAttribute('href'), url).href;
        });
        const docClone = doc.cloneNode(true);
        const article = new Readability(docClone).parse();
        let preview;
        if (article) {
            if (article.title)
                preview = `<h1>${article.title}</h1>` + article.content;
            else if (title)
                preview = `<h1>${title}</h1>` + article.content;
            else
                preview = article.content;
        }
        let domain = (new URL(url));
        domain = domain.hostname;
        const coverImage = (doc.querySelector('meta[property~="og:image"]') && new URL(doc.querySelector('meta[property~="og:image"]').content, url).href) ||
            (doc.querySelector('meta[property~="twitter:image"]') && new URL(doc.querySelector('meta[property~="twitter:image"]').content, url).href);
        let images = [];
        doc.querySelectorAll('img').forEach((i) => {
            if (i.getAttribute('src') != null)
                images.push(i.getAttribute('src'));
        });
        const favicon = (doc.querySelector('link[rel~="icon"]') && doc.querySelector('link[rel~="icon"]').getAttribute('href')) ||
            ('http://www.google.com/s2/favicons?domain=' + domain);
        const title = (doc.querySelector('title') && doc.querySelector('title').innerText) ||
            (doc.querySelector('meta[property~="og:title"]') && doc.querySelector('meta[property~="og:title"]').content) ||
            (doc.querySelector('meta[property~="twitter:title"]') && doc.querySelector('meta[property~="twitter:title"]').content);
        const description = (doc.querySelector('meta[property~="og:description"]') && doc.querySelector('meta[property~="og:description"]').content) ||
            (doc.querySelector('meta[property~="twitter:description"]') && doc.querySelector('meta[property~="twitter:description"]').content);
        const type = (doc.querySelector('meta[property~="og:type"]') && doc.querySelector('meta[property~="og:type"]').content) ||
            (doc.querySelector('meta[property~="twitter:card"]') && doc.querySelector('meta[property~="twitter:card"]').content) ||
            'undefined';
        result = {
            'message': 'success',
            'info': {
                url,
                domain,
                coverImage,
                images,
                favicon,
                title,
                description,
                type,
                preview
            }
        };
        console.log(result);
    }
    return result;
}