'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const booking=$('#booking'),menu=$('#mobile-menu'),openers=new WeakMap();
function openDialog(d,trigger){openers.set(d,trigger);d.showModal();document.body.classList.add('modal-open');}
function finishClose(d){document.body.classList.toggle('modal-open',[booking,menu].some(x=>x.open));$('.menu-toggle').setAttribute('aria-expanded',String(menu.open));const opener=openers.get(d);if(opener?.isConnected)opener.focus({preventScroll:true});}
function closeDialog(d){d.close();finishClose(d);}
document.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const d=[booking,menu].find(x=>x.open);if(!d)return;const items=$$('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',d).filter(x=>x.getClientRects().length);if(!items.length){e.preventDefault();return;}const first=items[0],last=items[items.length-1],outside=!d.contains(document.activeElement);if(e.shiftKey&&(document.activeElement===first||outside)){e.preventDefault();last.focus();}else if(!e.shiftKey&&(document.activeElement===last||outside)){e.preventDefault();first.focus();}});
const formResetResult=form=>{$('.form-fields',form).hidden=false;$('.form-submit',form).hidden=false;$('.form-result',form).hidden=true;};
$$('[data-book]').forEach(b=>b.addEventListener('click',()=>{const form=$('form',booking);formResetResult(form);$('[name=service]',form).value=b.dataset.service||'';openDialog(booking,b);}));
$('[data-close-book]').addEventListener('click',()=>closeDialog(booking));
$('.menu-toggle').addEventListener('click',e=>{openDialog(menu,e.currentTarget);e.currentTarget.setAttribute('aria-expanded','true');});
$('[data-close-menu]').addEventListener('click',()=>closeDialog(menu));
$$('a',menu).forEach(a=>a.addEventListener('click',()=>closeDialog(menu)));
[booking,menu].forEach(d=>{d.addEventListener('close',()=>finishClose(d));d.addEventListener('cancel',e=>{e.preventDefault();closeDialog(d);});d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(d);});});
$$('.request-form').forEach(form=>{const phone=$('[name=phone]',form),err=$('.field-error',form),result=$('.form-result',form);const clear=()=>{phone.removeAttribute('aria-invalid');err.hidden=true;};phone.addEventListener('input',clear);form.addEventListener('submit',e=>{e.preventDefault();const digits=phone.value.replace(/\D/g,'');if(!/^[+\d()\s-]+$/.test(phone.value)||!/^(?:[78]\d{10}|\d{10})$/.test(digits)){err.hidden=false;phone.setAttribute('aria-invalid','true');phone.focus();return;}clear();const second=$('[name=branch]',form).value==='2';const link=$('[data-result-phone]',form);link.href=second?'tel:+79270114411':'tel:+79272616363';link.innerHTML=(second?'Позвонить Дмитрию':'Позвонить Михаилу')+' <span aria-hidden="true">↗</span>';$('.form-fields',form).hidden=true;$('.form-submit',form).hidden=true;result.hidden=false;result.focus({preventScroll:true});});$('[data-edit]',form).addEventListener('click',()=>{formResetResult(form);phone.focus();});});
const search=$('#service-search');
if(search){const groups=$$('.catalog-group'),items=$$('[data-search]');const norm=t=>t.toLowerCase().replaceAll('ё','е').replace(/масл[а-я]*/g,'масл').replace(/кондиционер[а-я]*/g,'кондиционер').replace(/тормоз[а-я]*/g,'тормоз').replace(/подвес[а-я]*/g,'подвес').replace(/диагностик[а-я]*/g,'диагностик').replace(/[^a-zа-я0-9]+/g,' ').trim();const texts=new Map(items.map(i=>[i,norm(i.dataset.search)]));function filter(){const tokens=norm(search.value).split(/\s+/).filter(Boolean);let found=0;groups.forEach(g=>{let count=0;$$('[data-search]',g).forEach(i=>{i.hidden=!tokens.every(t=>texts.get(i).includes(t));if(!i.hidden)count++;});g.hidden=!count;found+=count;});$('.empty-results').hidden=found>0;$('#search-status').textContent=tokens.length?'Найдено услуг: '+found:'';}search.addEventListener('input',filter);$('#reset-search').addEventListener('click',()=>{search.value='';filter();search.focus();});$$('[data-category]').forEach(a=>a.addEventListener('click',()=>{search.value='';filter();}));filter();}
const estimator=$('#estimate');
if(estimator){
 const checks=$$('input[name=estimate-service]',estimator),hours=$('#estimate-hours'),list=$('[data-estimate-selected]'),hourlyNote=$('[data-estimate-hourly]'),reset=$('[data-estimate-reset]'),context=$('[data-estimate-context]'),estimateForm=$('#estimate-request');
 const format=x=>new Intl.NumberFormat('ru-RU').format(x),range=(a,b)=>format(a)+'–'+format(b)+' ₽';
 function update(changed){
  const maintenance='tekhnicheskoe-obsluzhivanie',oil='zamena-masla-dvigatelya';
  if(changed?.checked&&[maintenance,oil].includes(changed.value)){
   const other=checks.find(c=>c.value===(changed.value===maintenance?oil:maintenance));
   if(other.checked){other.checked=false;$('[data-estimate-alternative]').textContent=changed.value===maintenance?'Выбрано ТО вместо отдельной замены масла. Состав ТО уточнит мастер.':'Выбрана замена масла вместо ТО. Эти работы не складываются без уточнения состава.';}
  }
  const selected=checks.filter(c=>c.checked),suspension=selected.find(c=>c.dataset.hourly),unknownHours=!!suspension&&!hours.value;
  $('.estimate-hours').hidden=!suspension;
  let min=0,max=0;list.replaceChildren();
  selected.forEach(c=>{
   const name=$('.estimate-choice>span',c.closest('label')).textContent,multiplier=c.dataset.hourly?Number(hours.value):1;
   const item=document.createElement('li'),nameEl=document.createElement('span'),amount=document.createElement('strong');
   nameEl.textContent=name+(c.dataset.hourly&&hours.value?' · '+hours.selectedOptions[0].textContent:'');
   amount.textContent=c.dataset.hourly&&!hours.value?range(Number(c.dataset.min),Number(c.dataset.max))+' / час':range(Number(c.dataset.min)*multiplier,Number(c.dataset.max)*multiplier);
   item.append(nameEl,amount);list.append(item);
   if(multiplier){min+=Number(c.dataset.min)*multiplier;max+=Number(c.dataset.max)*multiplier;}
  });
  list.hidden=!selected.length;reset.hidden=!selected.length;
  let label='Предварительный расчёт',total='Выберите работу';
  if(selected.length){
   if(unknownHours&&selected.length===1){label='Тариф ремонта подвески';total='900–1 800 ₽ / час';}
   else if(unknownHours){label='Работы без почасового ремонта';total=range(min,max);}
   else total=range(min,max);
  }
  $('[data-estimate-label]').textContent=label;$('#estimate-total').textContent=total;
  hourlyNote.hidden=!unknownHours||selected.length===1;
  hourlyNote.textContent='Дополнительно: ремонт подвески 900–1 800 ₽ / час. Число часов пока неизвестно и в сумму выше не включено.';
  $('[data-estimate-combination]').hidden=!(selected.some(c=>c.value==='promyvka-radiatorov')&&selected.some(c=>c.value==='obsluzhivanie-konditsionera'));
  context.hidden=true;context.textContent=selected.length?'Выбрано работ: '+selected.length+'. '+label+': '+total+'.':'';
  $('[data-estimate-breakdown]').hidden=!selected.length;$('[data-estimate-count]').textContent=String(selected.length);
  $$('[data-estimate-category]').forEach(tab=>{const count=selected.filter(c=>c.dataset.category===tab.dataset.estimateCategory).length;const badge=$('[data-category-count]',tab);badge.hidden=!count;badge.textContent=String(count);});
  if(changed)formResetResult(estimateForm);
 }
 checks.forEach(c=>c.addEventListener('change',()=>update(c)));
 hours.addEventListener('change',()=>{formResetResult(estimateForm);update();});
 reset.addEventListener('click',()=>{checks.forEach(c=>c.checked=false);hours.value='';$('[data-estimate-alternative]').textContent='ТО и отдельная замена масла в двигателе — альтернативы в этом расчёте. Состав ТО уточнит мастер.';formResetResult(estimateForm);update();$('[role=tabpanel]:not([hidden]) input',estimator)?.focus({preventScroll:true});});
 const tabs=$$('[data-estimate-category]');
 function showCategory(tab){tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;$('#'+t.getAttribute('aria-controls')).hidden=!active;});$('[data-estimate-alternative]').hidden=tab.dataset.estimateCategory!=='obsluzhivanie';}
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>showCategory(tab));tab.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?tabs[0]:e.key==='End'?tabs[tabs.length-1]:tabs[(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length];showCategory(next);next.focus();});});
 update();
}

const galleryTrack=$('.gallery-grid');
if(galleryTrack)galleryTrack.addEventListener('keydown',e=>{if(e.target!==galleryTrack||!['ArrowRight','ArrowLeft'].includes(e.key))return;if(galleryTrack.scrollWidth<=galleryTrack.clientWidth)return;e.preventDefault();galleryTrack.scrollBy({left:(e.key==='ArrowRight'?1:-1)*galleryTrack.clientWidth*.85,behavior:'auto'});});
