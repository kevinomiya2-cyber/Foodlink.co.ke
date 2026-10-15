"use client";

import Link from "next/link";
import { useEffect,useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc,getDoc } from "firebase/firestore";
import { getFirebaseAuth,getFirebaseDb } from "@/lib/firebase/client";

type Profile={fullName?:string;role?:string;isVerified?:boolean};
const cards:Record<string,{title:string;description:string;href:string;action:string}[]> = {
 customer:[{title:"Explore food",description:"Browse meals and discover food businesses.",href:"/marketplace",action:"Open marketplace"},{title:"My orders",description:"Check order history and order status.",href:"/orders",action:"View orders"},{title:"Become a partner",description:"Apply to join as a chef, supplier or delivery rider.",href:"/apply",action:"Apply to join"}],
 chef:[{title:"Manage menu",description:"Add dishes, photos and prices.",href:"/chef/menu",action:"Manage menu"},{title:"Incoming orders",description:"Review and update customer orders.",href:"/dashboard",action:"Open orders"},{title:"Partner status",description:"Check your FoodLink account.",href:"/dashboard",action:"My account"}],
 supplier:[{title:"Product catalogue",description:"List ingredients, supplies, prices and stock.",href:"/supplier",action:"Manage products"},{title:"Partner status",description:"Check your FoodLink account.",href:"/dashboard",action:"My account"}],
 rider:[{title:"Delivery jobs",description:"View assigned delivery jobs and update progress.",href:"/rider",action:"Open deliveries"},{title:"Partner status",description:"Check your FoodLink account.",href:"/dashboard",action:"My account"}],
 admin:[{title:"Partner applications",description:"Approve or reject chef, supplier and rider applications.",href:"/admin/applications",action:"Review applications"},{title:"Marketplace",description:"Browse food listings.",href:"/marketplace",action:"Open marketplace"}]
};
export default function WorkspacePage(){
 const [profile,setProfile]=useState<Profile|null>(null);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
 useEffect(()=>onAuthStateChanged(getFirebaseAuth(),async user=>{if(!user){window.location.href="/login?next=%2Fworkspace";return;}try{const snap=await getDoc(doc(getFirebaseDb(),"profiles",user.uid));setProfile(snap.exists()?snap.data() as Profile:{fullName:user.displayName||"",role:"customer"});}catch{setError("Could not load your profile. Check Firestore setup.");}finally{setLoading(false);}}),[]);
 const role=profile?.role||"customer";
 return <main style={{minHeight:"100vh",background:"#f8f6ef",color:"#1c241d"}}><header style={{maxWidth:1120,margin:"0 auto",padding:"22px 24px",display:"flex",justifyContent:"space-between",borderBottom:"1px solid #e6e2d7"}}><Link href="/" style={{fontSize:24,fontWeight:800}}>food<span style={{color:"#a97b2c"}}>link</span></Link><Link href="/dashboard" style={{fontWeight:700}}>Account details ↗</Link></header><section style={{maxWidth:1120,margin:"0 auto",padding:"42px 24px 72px"}}><p style={{color:"#a97b2c",letterSpacing:2,fontSize:10,fontWeight:800}}>YOUR FOODLINK WORKSPACE</p><h1 style={{fontFamily:"Georgia,serif",fontSize:"clamp(38px,6vw,58px)",lineHeight:1.08,fontWeight:500,margin:"14px 0"}}>Welcome{profile?.fullName?", "+profile.fullName.split(" ")[0]:""}.</h1><p style={{color:"#667067",lineHeight:1.8}}>Your account role is <strong>{role}</strong>. Partner and admin access must be approved.</p>{loading&&<p>Loading workspace…</p>}{error&&<p role="alert">{error}</p>}<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,270px),1fr))",gap:16,marginTop:30}}>{(cards[role]||cards.customer).map(card=><article key={card.title} style={{background:"#fffdf8",border:"1px solid #e6e2d7",borderRadius:12,padding:24}}><h2 style={{fontFamily:"Georgia,serif",fontSize:24,fontWeight:500,margin:"0 0 10px"}}>{card.title}</h2><p style={{color:"#667067",fontSize:13,lineHeight:1.8,minHeight:55}}>{card.description}</p><Link href={card.href} style={{display:"inline-block",background:"#344b38",color:"white",padding:"12px 15px",borderRadius:6,fontSize:12,fontWeight:800}}>{card.action} ↗</Link></article>)}</div><p style={{marginTop:24,color:"#667067",fontSize:12,lineHeight:1.7}}>Order payments and M-Pesa are not live. Do not make payment based on a sample menu or demo listing.</p></section></main>;
}
