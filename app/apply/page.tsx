"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";

export default function ApplyPage() {
  const [uid,setUid] = useState("");
  const [role,setRole] = useState("chef");
  const [fullName,setFullName] = useState("");
  const [phone,setPhone] = useState("");
  const [business,setBusiness] = useState("");
  const [location,setLocation] = useState("");
  const [experience,setExperience] = useState("");
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  const [message,setMessage] = useState("");
  useEffect(()=>onAuthStateChanged(getFirebaseAuth(), user=>{ if(!user){setUid("");return;} setUid(user.uid); setFullName(user.displayName || ""); }),[]);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault(); setError(""); setMessage("");
    if(!uid){window.location.href="/login?next=%2Fapply";return;}
    setBusy(true);
    try{
      const db=getFirebaseDb();
      const profile=await getDoc(doc(db,"profiles",uid));
      if(!profile.exists()) throw new Error("Your profile is not ready yet. Sign out, sign in, and try again.");
      await addDoc(collection(db,"partnerApplications"),{userId:uid,requestedRole:role,fullName:fullName.trim(),phone:phone.trim(),businessName:business.trim(),location:location.trim(),experience:experience.trim(),status:"pending",createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
      setMessage("Application submitted. FoodLink will review it before enabling partner tools.");
      setPhone("");setBusiness("");setLocation("");setExperience("");
    }catch(e){setError(e instanceof Error?e.message:"Application could not be submitted. Check Firebase configuration.");}
    finally{setBusy(false);}
  }
  const field={width:"100%",boxSizing:"border-box" as const,padding:12,marginTop:6,border:"1px solid #dedacd",borderRadius:6,background:"#fffdf8",font:"inherit"};
  return <main style={{minHeight:"100vh",background:"#f8f6ef",color:"#1c241d"}}><header style={{maxWidth:980,margin:"0 auto",padding:"22px 24px",display:"flex",justifyContent:"space-between",borderBottom:"1px solid #e6e2d7"}}><Link href="/" style={{fontSize:24,fontWeight:800}}>food<span style={{color:"#a97b2c"}}>link</span></Link><Link href="/dashboard" style={{fontWeight:700}}>My account ↗</Link></header><section style={{maxWidth:760,margin:"0 auto",padding:"42px 24px 70px"}}><p style={{color:"#a97b2c",letterSpacing:2,fontSize:10,fontWeight:800}}>JOIN THE FOODLINK NETWORK</p><h1 style={{fontFamily:"Georgia,serif",fontSize:"clamp(36px,6vw,54px)",fontWeight:500,margin:"12px 0"}}>Build with <em>FoodLink.</em></h1><p style={{color:"#667067",lineHeight:1.8}}>Apply as a chef or food business, ingredient supplier, or delivery rider. Every application is reviewed. Signup does not automatically grant partner access.</p>{!uid&&<p style={{background:"#f1e8d4",padding:12,borderRadius:7}}>Sign in first, then complete your partner application.</p>}{error&&<p role="alert" style={{background:"#f8e8df",padding:12,borderRadius:7}}>{error}</p>}{message&&<p role="status" style={{background:"#e8f0e3",padding:12,borderRadius:7}}>{message}</p>}<form onSubmit={submit} style={{display:"grid",gap:16,marginTop:24,background:"#fffdf8",border:"1px solid #e6e2d7",borderRadius:12,padding:22}}><label style={{fontSize:12,fontWeight:700}}>Partner type<select value={role} onChange={e=>setRole(e.target.value)} style={field}><option value="chef">Chef / restaurant / food business</option><option value="supplier">Food or kitchen supplier</option><option value="rider">Delivery rider</option></select></label><label style={{fontSize:12,fontWeight:700}}>Full name<input required minLength={2} value={fullName} onChange={e=>setFullName(e.target.value)} style={field}/></label><label style={{fontSize:12,fontWeight:700}}>Phone number<input required value={phone} onChange={e=>setPhone(e.target.value)} style={field} placeholder="07xx xxx xxx"/></label><label style={{fontSize:12,fontWeight:700}}>Business name (if applicable)<input value={business} onChange={e=>setBusiness(e.target.value)} style={field}/></label><label style={{fontSize:12,fontWeight:700}}>Town / service area<input required minLength={2} value={location} onChange={e=>setLocation(e.target.value)} style={field} placeholder="e.g. Limuru, Kiambu"/></label><label style={{fontSize:12,fontWeight:700}}>Experience and details<textarea value={experience} onChange={e=>setExperience(e.target.value)} style={field} rows={4} placeholder="Tell us about your business, products, vehicle or experience."/></label><button disabled={busy} style={{border:0,borderRadius:6,padding:13,background:"#344b38",color:"white",fontWeight:800}}>{busy?"Submitting…":"Submit application"}</button></form></section></main>;
}
