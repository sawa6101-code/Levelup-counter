const rarityConfig={R:{max:150,breaks:[{lv:25,cost:30},{lv:50,cost:60},{lv:75,cost:90},{lv:100,cost:120},{lv:125,cost:150}]},SR:{max:175,breaks:[{lv:25,cost:50},{lv:50,cost:100},{lv:75,cost:200},{lv:100,cost:300},{lv:125,cost:400},{lv:150,cost:600}]},SSR:{max:200,breaks:[{lv:25,cost:60},{lv:50,cost:120},{lv:75,cost:240},{lv:100,cost:360},{lv:125,cost:480},{lv:150,cost:720},{lv:175,cost:900}]}};

// 「Lv X → X+1」に必要な経験の果実（赤リンゴ）数。
function expForNextLevel(lv){
  if(lv>=1&&lv<=24)return 100+35*(lv-1);
  if(lv>=25&&lv<=49)return 980+75*(lv-25);
  if(lv>=50&&lv<=74)return 3100+320*(lv-50);
  if(lv>=75&&lv<=99)return 10950+170*(lv-75);
  if(lv>=100&&lv<=124)return 15400+370*(lv-100);
  if(lv>=125&&lv<=149)return 24400+120*(lv-125);
  if(lv>=150&&lv<=174)return 27900+620*(lv-150);
  if(lv>=175&&lv<=199)return 43100+320*(lv-175);
  return 0;
}

// 現在Lvに到達するまでに必要だった赤リンゴの累計。
function expToReachLevel(level){
  let total=0;
  for(let lv=1;lv<level;lv++)total+=expForNextLevel(lv);
  return total;
}

function formatNumber(n){return n.toLocaleString('ja-JP');}

let rarity='R';
const levelInput=document.getElementById('level');
const help=document.getElementById('level-help');
const redResult=document.getElementById('redResult');
const rainbowResult=document.getElementById('rainbowResult');
const redDetail=document.getElementById('redDetail');
const rainbowDetail=document.getElementById('rainbowDetail');
const breakdown=document.getElementById('breakdown');

function calculate(){
  const config=rarityConfig[rarity];
  let level=Number.parseInt(levelInput.value,10);
  if(!Number.isFinite(level))level=1;
  level=Math.max(1,Math.min(config.max,level));
  levelInput.value=level;
  levelInput.max=config.max;
  help.textContent=`${rarity}の最大Lv：${config.max}`;

  const targetExp=expToReachLevel(config.max);
  const currentExp=expToReachLevel(level);
  const red=Math.max(0,targetExp-currentExp);
  redResult.textContent=formatNumber(red);
  redDetail.textContent=level===config.max?`Lv${config.max}（最大Lv）`:`Lv${level} → Lv${config.max}`;

  const remainingBreaks=config.breaks.filter(item=>item.lv>level);
  const rainbow=remainingBreaks.reduce((sum,item)=>sum+item.cost,0);
  rainbowResult.textContent=formatNumber(rainbow);
  rainbowDetail.textContent=remainingBreaks.length?`残り限界突破${remainingBreaks.length}回分`:'限界突破済み（最大Lv）';

  breakdown.innerHTML='';
  if(remainingBreaks.length===0){
    const row=document.createElement('div');
    row.className='break-row zero';
    row.innerHTML='<span class="lv">限界突破</span><span class="cost">残り 0個</span>';
    breakdown.appendChild(row);
  }else{
    remainingBreaks.forEach(item=>{
      const row=document.createElement('div');
      row.className='break-row';
      row.innerHTML=`<span class="lv">Lv${item.lv} 限界突破</span><span class="cost">🌈🍎 ${formatNumber(item.cost)}個</span>`;
      breakdown.appendChild(row);
    });
  }

  // 現在Lvが限界突破直後なら、次に必要な赤リンゴも明示。
  if(level<config.max){
    const nextExp=expForNextLevel(level);
    const nextBreak=config.breaks.find(item=>item.lv>level);
    const nextBreakText=nextBreak?`次の限界突破はLv${nextBreak.lv}`:'最大Lvまで';
    const row=document.createElement('div');
    row.className='break-row next';
    row.innerHTML=`<span class="lv">次Lvまで</span><span class="cost">🍎 ${formatNumber(nextExp)}個 · ${nextBreakText}</span>`;
    breakdown.prepend(row);
  }

  localStorage.setItem('levelup-counter',JSON.stringify({rarity,level}));
}

document.querySelectorAll('.rarity-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    rarity=btn.dataset.rarity;
    document.querySelectorAll('.rarity-btn').forEach(b=>b.classList.toggle('active',b===btn));
    const max=rarityConfig[rarity].max;
    if(Number(levelInput.value)>max)levelInput.value=max;
    calculate();
  });
});

levelInput.addEventListener('input',calculate);
document.getElementById('minus').addEventListener('click',()=>{levelInput.value=Math.max(1,Number(levelInput.value||1)-1);calculate()});
document.getElementById('plus').addEventListener('click',()=>{levelInput.value=Math.min(rarityConfig[rarity].max,Number(levelInput.value||1)+1);calculate()});

try{
  const saved=JSON.parse(localStorage.getItem('levelup-counter')||'null');
  if(saved&&rarityConfig[saved.rarity]){
    rarity=saved.rarity;
    document.querySelectorAll('.rarity-btn').forEach(b=>b.classList.toggle('active',b.dataset.rarity===rarity));
    levelInput.value=Math.min(rarityConfig[rarity].max,Math.max(1,Number(saved.level)||1));
  }
}catch(e){}

calculate();

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
}
