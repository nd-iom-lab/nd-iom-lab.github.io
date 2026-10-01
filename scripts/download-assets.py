from pathlib import Path
import json,urllib.request,concurrent.futures
r=Path(__file__).resolve().parents[1]
assets=json.loads((r/'migration/assets.json').read_text())
fonts={'avenir-light.woff2':'https://static.parastorage.com/fonts/v2/af36905f-3c92-4ef9-b0c1-f91432f16ac1/v1/avenir-lt-w01_35-light1475496.woff2','avenir-heavy.woff2':'https://static.parastorage.com/fonts/v2/74290729-59ae-4129-87d0-2eec3974dce1/v1/avenir-lt-w01_85-heavy1475544.woff2','oswald.woff2':'https://static.parastorage.com/tag-bundler/api/v1/fonts-cache/googlefont/woff2/s/oswald/v29/TK3iWkUHHAIjg752GT8Gl-1PKw.woff2'}
for n,u in fonts.items():assets['/assets/'+n]={'url':u}
def fetch(item):
 path,info=item;out=r/'public'/path.lstrip('/')
 if out.exists():return
 req=urllib.request.Request(info['url'],headers={'User-Agent':'Mozilla/5.0'})
 out.write_bytes(urllib.request.urlopen(req,timeout=90).read())
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:list(pool.map(fetch,assets.items()))
print('Saved',len(assets),'original image/font files; bytes',sum(p.stat().st_size for p in (r/'public/assets').iterdir()))
