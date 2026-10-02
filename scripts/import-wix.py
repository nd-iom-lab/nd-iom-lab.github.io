"""One-time public Wix snapshot import. Runtime/build never require Python or Wix."""
from pathlib import Path
from lxml import html
import json,re,copy
ROOT=Path(__file__).resolve().parents[1]
docs={p.stem:html.fromstring(p.read_text()) for p in (ROOT/'migration').glob('*.html')}
manifest={}
def asset(url,alt=''):
 url=url.split('/v1/')[0]; name=url.rsplit('/',1)[-1]; path='/assets/'+name
 manifest[path]={'url':url,'alt':alt};return {'src':path,'alt':alt}
def image(page,id,alt=None):
 e=docs[page].get_element_by_id(id); i=e if e.tag=='img' else e.xpath('.//img')[0]
 return asset(i.get('src'),alt if alt is not None else i.get('alt',''))
def clean(e):
 e=copy.deepcopy(e)
 for x in list(e.iter()):
  st=x.get('style',''); cl=x.get('class','');attrs={}
  if x.tag=='a':
   href=x.get('href','');href=href.replace('https://www.internetofmatter.org','')
   if href.startswith(('https://','http://','mailto:','/','#')):attrs['href']=href
   if x.get('target')=='_blank':attrs.update(target='_blank',rel='noopener noreferrer')
  styles=[]
  for rule in st.split(';'):
   if ':' not in rule:continue
   k,v=rule.split(':',1);k=k.strip();v=v.strip()
   if k in ['font-size','line-height','font-weight','font-style','text-decoration','color','letter-spacing']:styles.append(k+':'+v)
   if k=='font-family' and '85-heavy' in v:styles.append('font-family:AvenirHeavy,sans-serif')
   elif k=='font-family' and 'helvetica' in v:styles.append('font-family:Helvetica,Arial,sans-serif')
  if 'color_41' in cl: styles.append('color:#3d4dad')
  if styles:attrs['style']=';'.join(styles)
  x.attrib.clear();x.attrib.update(attrs)
  if x.tag in ['h1','h2','h3','h4','h5','h6']:x.tag='p'
  if x.text:x.text=x.text.replace('\u200b','')
  if x.tail:x.tail=x.tail.replace('\u200b','')
 for x in list(e.xpath('.//p')):
  if not x.text_content().strip() and not x.xpath('.//img'):x.getparent().remove(x)
 return e

def rich(page,id):return ''.join(html.tostring(x,encoding='unicode') for x in clean(docs[page].get_element_by_id(id)))
def plain(page,id):return docs[page].get_element_by_id(id).text_content().replace('\u200b','').strip()
def save(name,data):(ROOT/'content'/f'{name}.json').write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n')
# Shared header images and self-contained originals.
site={'name':'Internet of Matter Lab','logo':image('home','comp-mc9zbdrg','Internet of Matter Lab logo'),'hero':image('home','comp-mdakad82','Soft robotics, printed electronics and smart materials'),'tree':asset('https://static.wixstatic.com/media/37ae98_ef48aab603504d428fe0818c5951eb58~mv2.webp','Tree-shaped electronic circuit'),'navigation':[{'label':l,'path':p} for l,p in [('Home','/'),('Team','/team/'),('Projects & Publications','/s-projects-basic/'),('Teaching','/projects-7/'),('Opportunities','/opportunities/')]]}
save('site',site)
home={'openingHtml':rich('home','comp-mu0j9lzs'),'news':[],'visionHtml':rich('home','comp-ml5z45hg'),'visionImage':image('home','comp-mcs2f8vf','Sustainable lifecycle of computational devices'),'researchTitle':plain('home','comp-jy2p6a73'),'researchHtml':rich('home','comp-jy2qdu1t'),'olderNewsHtml':rich('home','comp-mcr56kmd'),'affiliations':image('home','comp-mlvyd6h6','Notre Dame research affiliations'),'gallery':[]}
for li in docs['home'].get_element_by_id('comp-mcrzur9f').xpath('.//li'):
 home['news'].append({'date':li.text_content().strip()[:10],'html':html.tostring(clean(li),encoding='unicode')})
for script in docs['home'].xpath('//script[@type="application/json"]'):
 try:o=json.loads(script.text)
 except:continue
 def walk(x):
  if isinstance(x,dict):
   if 'items' in x and isinstance(x['items'],list) and x['items'] and 'mediaUrl' in x['items'][0]:
    for item in x['items']:
     m=item['metaData'];home['gallery'].append(asset('https://static.wixstatic.com/media/'+item['mediaUrl'],m.get('alt') or m.get('fileName','Research gallery')))
   for v in x.values():walk(v)
  elif isinstance(x,list):
   for v in x:walk(v)
 walk(o)
save('home',home)
people=[('comp-md9s87bk','comp-monte6n1','comp-md9qndlt'),('comp-md9s90h4','comp-md9s7g1p','comp-mont89ls'),('comp-md9s9ct8','comp-mont93qx','comp-montccsl'),('comp-md9s9m05','comp-md9s9m03','comp-montg638'),('comp-md9s9zf4','comp-md9sgm1j','comp-mont3dkf'),('comp-md9s9zf8','comp-md9sgz59','comp-montlqof'),('comp-md9s9zfb','comp-md9sh3rj','comp-montlw8a'),('comp-montrb5j','comp-montrb5n','comp-montm6ga'),('comp-montqxq3','comp-montqxq7','comp-montq4o3'),('comp-mqm06hks','comp-mqm06hkw','comp-mqm05n7w'),('comp-mqm0c2dz','comp-mqm0c2e3','comp-mqm0bkcu')]
team={'title':'Our Team.','pi':{'name':'Tingyu Cheng','role':'Principal Investigator','office':plain('team','comp-md9sv1ia'),'biographyHtml':rich('team','comp-md9rac4t'),'portrait':image('team','comp-md9twtht','Tingyu Cheng'),'email':'tcheng2@nd.edu','contacts':[]},'members':[],'alumniHtml':rich('team','comp-mlvxp76d'),'groupPhotos':[]}
for id,label in [('comp-md9riw7q','Google Scholar'),('comp-md9rml0z','Twitter'),('comp-md9rqhf3','LinkedIn')]:
 e=docs['team'].get_element_by_id(id);team['pi']['contacts'].append({'label':label,'url':e.xpath('.//a/@href')[0],'icon':image('team',id,label)})
for name,role,im in people:
 e=docs['team'].get_element_by_id(name);team['members'].append({'name':plain('team',name),'roleHtml':rich('team',role),'url':next(iter(e.xpath('.//a/@href')),None),'portrait':image('team',im,plain('team',name))})
for year,ids in [('2026',['comp-mohqvnze','comp-mohqw1ej','comp-mohqz04b']),('2025',['comp-mlvxrfzb','comp-mlvxxvmt','comp-mlvxyb4a','comp-mlvy0j6a','comp-mlvxzhid','comp-mlvxyxk5'])]:team['groupPhotos'].append({'year':year,'images':[image('team',id,'Lab group photo, '+year) for id in ids]})
save('team',team)
projects=[('comp-mo6ji38b',['comp-mo6jnfgd']),('comp-mo6ji38m2',['comp-mo8prl6g','comp-mo6k61xd']),('comp-mo6jht9o2',['comp-mrfwfafc']),('comp-mo6jht9z',['comp-mrfwn2o0']),('comp-mdakuc13',['comp-mflqavx9']),('comp-mflpyasx2',['comp-mflq487y']),('comp-mflpweuw3',['comp-mflpweuk']),('comp-mdcjy8wi5',['comp-mdckwl7v']),('comp-mdck1shi6',['comp-mdck9l2d']),('comp-mdaobsly',['comp-mdaqt6lz','comp-mdaqudff']),('comp-mdaotg0g1',['comp-mdaotg0c']),('comp-mdaotg0n3',['comp-mdaotg0m2']),('comp-mdaowmn61',['comp-mdaowmmw']),('comp-mdchwg5p8',['comp-mdci8pqd','comp-mdciavik']),('comp-mdchwg5t1',['comp-mdcio69q']),('comp-mdcisl8b1',['comp-mdcj152e']),('comp-mdcisl8k2',['comp-mdcjf4e5'])]
pubs=[]
for index,(id,ims) in enumerate(projects):
 blocks=list(clean(docs['projects'].get_element_by_id(id)));meta=blocks.pop(0) if index else clean(docs['projects'].get_element_by_id('comp-mo6jrvub'))[0];title=blocks.pop(0)
 titletext=title.text_content().strip();titlehtml=''.join(html.tostring(x,encoding='unicode') for x in title) or title.text
 pubs.append({'title':titletext,'titleHtml':titlehtml,'meta':meta.text_content().strip(),'detailsHtml':''.join(html.tostring(x,encoding='unicode') for x in blocks),'images':[image('projects',im,titletext) for im in ims],**({'award':'Best Paper'} if index==4 else {})})
save('publications',pubs)
save('teaching',{'title':plain('teaching','comp-mlx9e3wi3'),'bodyHtml':rich('teaching','comp-mlx9e3wk1'),'photos':[image('teaching',id,'Emerging Interactive Technologies student project') for id in ['comp-mlx9w29s','comp-mlx9wo2s','comp-mlx9xquy','comp-mlxa0zx3','comp-mlxa1e54']]})
save('opportunities',{'title':'Opportunities','bodyHtml':rich('opportunities','comp-ke70w54k1'),'universityHtml':rich('opportunities','comp-mlx9iido'),'photos':[image('opportunities',id,'University of Notre Dame campus') for id in ['comp-mlx9gkun','comp-mlx9hfb8','comp-mlx9hrcj']]})
save('archive',{'title':'Research Publications','bodyHtml':rich('publications-archive','comp-ke6xjp0m')})
(ROOT/'migration/assets.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Imported',len(manifest),'assets;',len(pubs),'projects;',len(team['members']),'members;',len(home['gallery']),'gallery images')
