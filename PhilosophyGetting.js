const axios = require('axios');
const cheerio = require('cheerio');

const main = async () => {
    var biggestPath = 0;
    var biggestStartPage = '';

    for (var i = 0; i < 25; i++) {
        const startPage = await getPage();
        const path = await findPath(startPage);
        if (path) {
            const pageTitles = path.map((page) => decodeURIComponent(page));
            console.log(`There is a pathway to Philosophy from "${startPage}": ${path.length} pages`);
            console.log('Pathway:', pageTitles.join('\n'));
            if (path.length > biggestPath) {
                biggestPath = path.length;
                biggestStartPage = startPage;
            }
        } else {
            console.log(`No pathway to philosophy "${startPage}"`);
        }
    }
    console.log(`The biggest pathway to Philosophy starts from "${biggestStartPage}": ${biggestPath} pages`);
};

const findPath = async (startPage, visited = new Set(), path = []) => {
    if (startPage === 'Philosophy') {
        return path;
    }
    if (visited.has(startPage)) {
        return null;
    }
    visited.add(startPage);

    const links = await getLink(startPage);

    for (var i = 0; i < links.length; i++) {
        const diffPath = [...path, links[i]];
        const end = await findPath(links[i], visited, diffPath);
        if (end) {
            return end;
        }
    }

    return null;
};

const getPage = async () => {
    const site = await axios.get('https://en.wikipedia.org/wiki/Special:Random');
    const loader = cheerio.load(site.data);
    
    return loader('h1.firstHeading').text();
};

const getLink = async (page) => {
    const response = await axios.get(`https://en.wikipedia.org/wiki/${encodeURIComponent(page)}`);
    const $ = cheerio.load(response.data);
    const links = [];

    $('p > a').each((index, element) => {
        const href = $(element).attr('href');
        if (href && href.startsWith('/wiki/') && !href.includes(':')) {
            links.push(href.substring(6));
        }
    });
    return links;
};

main();