import React from 'react';
import {createRoot} from 'react-dom/client';
import AIStudioModal from '../../src/components/studio/AIStudioModal';
import PostCard from '../../src/components/feed/PostCard';
const mode=new URLSearchParams(location.search).get('mode');
const sample={id:'illustration-only',authorAlias:'Tanpa Nama',authorType:'tanpa_nama',content:'Tadi bilang “sama-sama” ke mesin parkir.',topic:'cerita-kecil',responseMode:'boleh_dibalas',reactions:{dengerin:0,relate:0,senyum:0,peluk:0},replies:[{id:'demo-reply',postId:'illustration-only',authorAlias:'Tanpa Nama',authorType:'tanpa_nama',content:'Mesinnya pasti terharu.',createdAt:'2026-10-27T00:00:00Z'}],reportCount:0,createdAt:'2026-10-27T00:00:00Z',paperColor:'cream',rotation:0};
createRoot(document.getElementById('app')).render(mode==='studio'?<AIStudioModal isOpen={true} onClose={()=>{}} onApplyToComposer={()=>{}}/>:<div style={{padding:30,width:500}}><PostCard post={sample} onReact={()=>{}} onReply={async()=>true} onReport={async()=>true}/></div>);
