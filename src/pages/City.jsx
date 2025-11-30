import React from "react";
import { useParams } from "react-router-dom";

export default function City(){
  const { slug } = useParams();
  return (
    <div className="container">
      <header><h1>{slug?.replace("-", " ")}</h1></header>
      <p>City page — live data, charts, health advice (coming soon)</p>
    </div>
  )
}
