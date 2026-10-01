"""Audit the local public Wix snapshots against generated HTML (requires lxml)."""
from pathlib import Path
from lxml import html
from collections import Counter
import re,json
root=Path(__file__).resolve().parents[1]
routes={'home':'index.html','team':'team/index.html','projects':'s-projects-basic/index.html','teaching':'projects-7/index.html','opportunities':'opportunities/index.html','publications-archive':'publications/index.html'}
report={}
for name,route in routes.items():
 old=html.fromstring((root/'migration'/f'{name}.html').read_text());new=html.fromstring((root/'dist'/route).read_text());main=new.xpath('//main')[0]
 blocks=[e for e in old.xpath('//*[@data-testid="richTextElement"]') if e.get('id')!='comp-jy41qfsw']
 oldtxt=' '.join(' '.join(e.itertext()) for e in blocks);newtxt=' '.join(main.itertext())
 words=lambda s:Counter(re.findall(r'\w+',s.lower().replace('\u200b','')))
 missing=words(oldtxt)-words(newtxt)
 oldlinks=Counter(url.replace('https://www.internetofmatter.org','') for e in blocks for url in e.xpath('.//a/@href'))
 newlinks=Counter(main.xpath('.//a/@href'));missinglinks=oldlinks-newlinks
 report[name]={'missingWords':dict(missing),'missingLinks':dict(missinglinks),'sourceWords':sum(words(oldtxt).values())}
 assert not missing and not missinglinks,(name,missing,missinglinks)
(root/'migration/content-parity.json').write_text(json.dumps(report,indent=2)+'\n')
print('PASS: all text words and rich-text link destinations preserved across six source pages.')
