import { useEffect, useRef, useState } from "react";

export function useRestTimer(totalDefault:number, onDone?:()=>void){
  const [active, setActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [total, setTotal] = useState(totalDefault);
  const [endAt, setEndAt] = useState(0);
  const pauseStamp = useRef(0);
  const [, force] = useState({});

  useEffect(()=>{
    if (!active) return;
    const t = setInterval(()=>{
      force({});
      const rem = Math.max(0, Math.ceil((endAt - Date.now())/1000));
      if (rem <= 0) {
        clearInterval(t);
        setActive(false);
        onDone?.();
      }
    }, 250);
    return ()=>clearInterval(t);
  }, [active, endAt, onDone]);

  const start = (secs?:number)=>{
    const n = secs ?? total;
    setTotal(n);
    setEndAt(Date.now() + n*1000);
    setActive(true);
    setPaused(false);
    pauseStamp.current = 0;
  };
  const stop = ()=>{ setActive(false); };
  const add = (sec:number)=>{ if (!active) return; setEndAt(p=>p + sec*1000); };
  const rem = () => active ? Math.max(0, Math.ceil((endAt - Date.now())/1000)) : 0;
  const toggle = ()=>{
    if (!active) return;
    if (paused){
      const delta = Date.now() - pauseStamp.current;
      setEndAt(p=>p+delta);
      setPaused(false);
    } else {
      pauseStamp.current = Date.now();
      setPaused(true);
    }
  };

  return { active, paused, total, setTotal, start, stop, add, rem: rem() , toggle };
}
