/* ═══ vocab-seed-1.js — 詞庫種子·第一批（共 253 條） ═══
   術語50｜樂派15｜風格補10｜核心分類178
   想改詞義唔使掂呢個檔——喺 App 詞庫頁改，自動標「已改」存落 private repo */
window.VOCAB_SEED_1=(()=>{
const T=[];
const add=(cat,a)=>a.forEach(([zh,en,tag,desc])=>T.push({cat,zh,en,tag:tag||'',desc:desc||''}));

add('術語',[
['揉音','vibrato','左手','手指／手臂週期擺動，令長音有起伏生命'],
['泛音','harmonic','左手','輕觸弦發出通透哨音；自然／人工兩種'],
['雙音','double stop','左手','一弓兩條弦同時響；音準角度係關鍵'],
['和弦','chord','左手','三音以上同時發聲；弓壓觸弦要協調'],
['分弓','détaché','弓法','一音一弓，平順乾淨嘅基礎弓法'],
['連弓','legato','弓法','一弓多音，圓滑連貫歌唱'],
['頓弓','martelé','弓法','每音起弓帶重量咬弦'],
['跳弓','spiccato','弓法','弓離弦跳動，輕巧有彈性'],
['控制跳弓','sautillé','弓法','中弓自然彈跳，快速段落必備'],
['拋弓','ricochet','弓法','弓跌落弦彈幾下，一弓多個跳音'],
['碎弓','tremolo','弓法','弓急速細分，緊張或綿密音流'],
['連頓弓','staccato','弓法','一弓多個頓音；上弓連頓係炫技極品'],
['飛跳弓','flying spiccato','弓法','一弓連續跳音跨多音'],
['換把','shifting','左手','滑移把位；隱形定發聲係風格抉擇'],
['顫音','trill','左手','兩音快速交替；結束方式有講究'],
['回音','turn','裝飾','圍繞主音嘅裝飾音型'],
['倚音','appoggiatura','裝飾','佔拍值嘅裝飾音，通常加重'],
['短倚音','acciaccatura','裝飾','快速掠過，唔佔拍值'],
['撥弦','pizzicato','右手','右手指撥弦發聲'],
['左手撥弦','left-hand pizz.','右手','左手指撥弦，常同拉弓疊加'],
['弓根','at the frog','弓位','弓尾端；音結實但難控'],
['弓尖','at the tip','弓位','弓尖端；音輕薄，弱奏好用'],
['全弓','whole bow','弓位','弓根到弓尖全程；分配係學問'],
['上半弓','upper half','弓位','中弓至弓尖'],
['下半弓','lower half','弓位','弓根至中弓'],
['弓速','bow speed','控制','快＝大音量，慢＝綿密'],
['弓壓','bow pressure','控制','壓力控制音色厚薄'],
['弓段分配','bow distribution','控制','邊段音符用邊截弓，長樂句核心'],
['接觸點','contact point','控制','弓同指板／琴橋距離決定音色'],
['空弦','open string','基礎','唔按指嘅弦；音色同按弦音有別'],
['音準','intonation','基礎','相對／絕對音高準確；純律平均律取捨'],
['音階','scale','基礎','調性骨架；每日基本功'],
['琶音','arpeggio','基礎','分解和弦'],
['視譜','sight-reading','基礎','即時讀譜演奏'],
['背譜','memorization','基礎','肌肉＋聽覺＋視覺三重記憶'],
['彈性速度','rubato','表情','彈性拉長短，唔破壞整體脈動'],
['漸強','crescendo','表情','漸大聲'],
['漸弱','diminuendo','表情','漸細聲'],
['突強','sforzando','表情','單音突然加重'],
['重音','accent','表情','音頭加重'],
['極弱','pianissimo','力度','pp；貼指板拉出薄霧感'],
['極強','fortissimo','力度','ff；靠近琴橋全弓放開'],
['慢板','adagio','速度','從容慢速'],
['行板','andante','速度','步行速度'],
['中板','moderato','速度','中速'],
['快板','allegro','速度','快而輕快'],
['急板','presto','速度','極快'],
['華彩','cadenza','體裁','協奏曲獨奏炫技插段'],
['展技曲','toccata','體裁','展示技巧嘅自由體裁'],
['終止式','cadence','分析','和聲收束點，曲式分析坐標']
]);

add('樂派',[
['德奧樂派','German-Austrian','','巴赫到布拉姆斯：對位與結構傳統'],
['法蘭西樂派','French','','講究色彩、清晰同優雅'],
['俄羅斯樂派','Russian','','濃烈歌唱性同戲劇對比'],
['義大利樂派','Italian','','歌劇式歌唱與炫技傳統'],
['國民樂派','Nationalist','','取材民族音樂語彙'],
['印象樂派','Impressionist','','德布西式色塊與氛圍'],
['新維也納樂派','Second Viennese','','荀白克十二音體系一脈'],
['表現主義','Expressionism','','極端情感張力'],
['新古典主義','Neoclassicism','','返古典平衡，客觀冷靜'],
['法比學派','Franco-Belgian school','小提琴','維尼奧夫斯基·伊薩伊一脈；乾淨華美'],
['俄羅斯學派','Russian violin school','小提琴','奧爾一脈；歌唱與熱情'],
['德奧學派','German violin school','小提琴','約阿希姆一脈；嚴謹重結構'],
['匈牙利學派','Hungarian school','小提琴','弗萊什·西蓋蒂；分析與智性'],
['美國學派','American school','小提琴','多源融合，技術規格化'],
['古樂運動','HIP movement','','古樂器＋考據還原演奏']
]);

add('風格取向',[
['戲劇性','','','段落對比大，張力先行'],
['抒情歌唱','','','以歌線思維拉旋律'],
['理性克制','','','情感收斂，結構清晰'],
['豪邁奔放','','','開揚直接，能量外放'],
['精緻優雅','','','細節雕琢，貴氣'],
['憂鬱深沉','','','暗色底調，內省'],
['明快俏皮','','','輕盈機靈'],
['莊嚴宏偉','','','儀式感與厚度'],
['質樸自然','','','唔加修飾，直白'],
['激情燃燒','','','高能量浪漫化處理']
]);

add('樂器',[
['小提琴','violin','',''],['中提琴','viola','',''],['大提琴','cello','',''],
['低音提琴','double bass','',''],['鋼琴','piano','',''],['羽管鍵琴','harpsichord','',''],
['管風琴','organ','',''],['豎琴','harp','',''],['吉他','guitar','',''],
['長笛','flute','',''],['短笛','piccolo','',''],['雙簧管','oboe','',''],
['單簧管','clarinet','',''],['巴松管','bassoon','',''],['小號','trumpet','',''],
['圓號','horn','',''],['長號','trombone','',''],['大號','tuba','',''],
['定音鼓','timpani','',''],['小鼓','snare drum','',''],['大鼓','bass drum','',''],
['鑔','cymbals','',''],['三角鐵','triangle','',''],
['女高音','soprano','',''],['女中音','mezzo-soprano','',''],
['男高音','tenor','',''],['男低音','bass','',''],
['弦樂四重奏','string quartet','組合',''],['鋼琴三重奏','piano trio','組合',''],
['交響樂團','symphony orchestra','組合','']
]);

add('Roles',[
['獨奏','solo','',''],['伴奏','accompanist','',''],['室內樂','chamber','',''],
['樂團首席','concertmaster','',''],['客席獨奏','guest soloist','',''],
['指揮','conductor','',''],['音樂總監','music director','',''],
['作曲','composer','',''],['編曲改編','arranger','',''],['通奏低音','continuo','','']
]);

add('時期',[
['中世紀','Medieval','',''],['文藝復興','Renaissance','',''],
['巴洛克','Baroque','',''],['古典','Classical','',''],
['早期浪漫','Early Romantic','',''],['晚期浪漫','Late Romantic','',''],
['印象派','Impressionist','',''],['現代','Modern','',''],['當代','Contemporary','','']
]);

add('曲式',[
['奏鳴曲式','sonata form','',''],['呈示部','exposition','',''],
['發展部','development','',''],['再現部','recapitulation','',''],
['第一主題','first theme','',''],['第二主題','second theme','',''],
['過渡','transition','',''],['華彩段','cadenza','',''],
['尾聲','coda','',''],['引子','introduction','',''],
['二段體','binary form','',''],['三段體','ternary form','',''],
['迴旋曲式','rondo','',''],['變奏曲式','variations','',''],
['賦格','fugue','',''],['卡農','canon','',''],
['宣敘段','recitative','',''],['詼諧曲','scherzo','',''],
['慢板樂章','slow movement','',''],['終曲','finale','','']
]);

add('Label',[
['DG','Deutsche Grammophon','',''],['Decca','Decca','',''],
['Sony Classical','Sony Classical','',''],['RCA Red Seal','RCA Red Seal','',''],
['EMI Classics','EMI Classics','',''],['Warner Classics','Warner Classics','',''],
['Philips','Philips Classics','',''],['Mercury','Mercury Living Presence','',''],
['Testament','Testament','',''],['Chandos','Chandos','',''],
['BIS','BIS Records','',''],['Hyperion','Hyperion','',''],
['Naxos','Naxos','',''],['ECM','ECM Records','',''],
['Erato','Erato','',''],['Teldec','Teldec','',''],
['harmonia mundi','harmonia mundi','',''],['Alpha','Alpha Classics','',''],
['Pentatone','Pentatone','',''],['Ondine','Ondine','','']
]);

add('錄音類型',[
['錄音室','studio','',''],['現場錄音','live','',''],
['歷史錄音','historical','',''],['電台存檔','radio archive','',''],
['影片','video','',''],['排練記錄','rehearsal','','']
]);

add('速度印象',[
['偏快','faster','',''],['適中','moderate','',''],['偏慢','slower','',''],
['彈性速度大','free tempo','',''],['節奏極穩','metronomic','','']
]);

add('音色取向',[
['溫暖','warm','',''],['明亮','bright','',''],['深暗','dark','',''],
['圓潤','round','',''],['金屬感','metallic','',''],['柔美','sweet','',''],
['絲絨質感','velvety','',''],['木質感','woody','',''],['銳利','edgy','',''],
['厚實','thick','',''],['清透','clear','',''],['沙啞粗獷','raspy','','']
]);

add('總調性',[
['C大調','C major','',''],['a小調','A minor','',''],
['G大調','G major','',''],['e小調','E minor','',''],
['D大調','D major','',''],['b小調','B minor','',''],
['A大調','A major','',''],['f#小調','F# minor','',''],
['E大調','E major','',''],['c#小調','C# minor','',''],
['B大調','B major','',''],['g#小調','G# minor','',''],
['F#大調','F# major','',''],['d#小調','D# minor','',''],
['Db大調','Db major','',''],['bb小調','Bb minor','',''],
['Ab大調','Ab major','',''],['f小調','F minor','',''],
['Eb大調','Eb major','',''],['c小調','C minor','',''],
['Bb大調','Bb major','',''],['g小調','G minor','',''],
['F大調','F major','',''],['d小調','D minor','','']
]);

add('編制',[
['無伴奏獨奏','solo unaccompanied','',''],['獨奏與鋼琴','solo with piano','',''],
['獨奏與樂團','solo with orchestra','',''],['二重奏','duo','',''],
['鋼琴三重奏','piano trio','',''],['弦樂四重奏','string quartet','',''],
['鋼琴五重奏','piano quintet','',''],['室內樂','chamber','',''],
['管弦樂','orchestral','',''],['聲樂與樂隊','voice and orchestra','','']
]);

add('作品編號',[
['Op.','opus number','',''],['BWV','Bach works catalogue','',''],
['K.','Mozart Köchel','',''],['D.','Schubert Deutsch','',''],
['S.','Liszt Searle','',''],['RV','Vivaldi Ryom','',''],
['Hob.','Haydn catalogue','',''],['MWV','Mendelssohn catalogue','',''],
['L.','Debussy Lesure','',''],['Wq.','C.P.E. Bach Wotquenne','','']
]);

add('樂譜版本',[
['亨樂 Henle','G. Henle Verlag','',''],['騎熊士 Bärenreiter','Bärenreiter','',''],
['彼得斯 Peters','Edition Peters','',''],['大熊 Breitkopf','Breitkopf & Härtel','',''],
['IMSLP 原版','IMSLP public domain','',''],['Schirmer','G. Schirmer','',''],
['Ricordi','Ricordi','',''],['Durand','Durand','',''],
['Curci','Curci','',''],['Carl Fischer','Carl Fischer','','']
]);

add('技巧面向',[
['揉音控制','vibrato control','',''],['色彩變化','tone colour','',''],
['雙音準確度','double-stop accuracy','',''],['和弦響亮度','chord resonance','',''],
['泛音','harmonics','',''],['撥弦','pizzicato','',''],
['跳弓輕盈度','spiccato lightness','',''],['換把乾淨度','shift smoothness','',''],
['音準','intonation','',''],['節奏精準','rhythmic precision','',''],
['弓速控制','bow speed control','',''],['弓段分配','bow distribution','','']
]);

return T;
})();
