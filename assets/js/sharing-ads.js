/* GN24 SHARING ADS · community support carousel v0.1 */
(function(){
'use strict';
var seed=[
{icon:'🍚',tag:'무료 상생광고',name:'우리동네 오래된 전통가게',copy:'오랜 시간 지역을 지켜온 식당과 가게를 소개합니다.'},
{icon:'🏪',tag:'소상공인 지원',name:'작지만 소중한 지역 업체',copy:'광고의 도움이 필요한 작은 사업장을 응원합니다.'},
{icon:'🤝',tag:'지역사회',name:'나눔과 공익을 실천하는 단체',copy:'지역을 위해 묵묵히 활동하는 사람과 단체를 알립니다.'},
{icon:'🌏',tag:'GLOBAL SUPPORT',name:'세계의 작은 기업과 가게',copy:'GLOBAL NEWS24 국가판과 함께 현지 소기업을 소개합니다.'},
{icon:'📣',tag:'30일 무료지원',name:'GN24 상생광고 참여 모집',copy:'첫 캠페인은 광고비 없이 홍보가 필요한 이웃과 함께합니다.',href:'/pages/contact/?type=sharing-ad'}
];
function card(a){var el=document.createElement(a.href?'a':'article');el.className='gn24-sharing-card';if(a.href)el.href=a.href;el.innerHTML='<div class="gn24-sharing-media" aria-hidden="true">'+a.icon+'</div><div class="gn24-sharing-copy"><small>'+a.tag+'</small><b>'+a.name+'</b><span>'+a.copy+'</span></div>';return el}
function init(){var track=document.getElementById('gn24SharingTrack');if(!track)return;seed.concat(seed).forEach(function(a){track.appendChild(card(a))});if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;var paused=false,timer;function step(){if(paused)return;var first=track.querySelector('.gn24-sharing-card');if(!first)return;var amount=first.getBoundingClientRect().width+12;var end=track.scrollWidth-track.clientWidth;if(track.scrollLeft+amount>=end-4){track.scrollTo({left:0,behavior:'auto'})}else{track.scrollBy({left:amount,behavior:'smooth'})}}function start(){clearInterval(timer);timer=setInterval(step,4200)}track.addEventListener('pointerdown',function(){paused=true});track.addEventListener('pointerup',function(){paused=false;start()});track.addEventListener('mouseenter',function(){paused=true});track.addEventListener('mouseleave',function(){paused=false;start()});document.addEventListener('visibilitychange',function(){if(document.hidden)clearInterval(timer);else start()});start()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
}());