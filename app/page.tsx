"use client";
import { ActiveElement, Attributes, CustomFabricObject } from "@/types/type";
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import { Room } from "./Room";
// import { CollaborativeApp } from "./CollaborativeApp";
import Live from "@/components/Live"
import LeftSidebar from "@/components/LeftSidebar";


import { fabric } from "fabric";
import { handleCanvasMouseDown, handleResize, initializeFabric } from "@/lib/canvas";
export default function Page() {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const shapeRef = useRef<fabric.Object | null>(null);
  const selectedShapeRef = useRef<string | null>('rectangle');

  const [activeElement, setActiveElement] = useState<ActiveElement>({
    name: '',
    value: '',
    icon: '',
  } )

  const handleActiveElement = (elem: ActiveElement) => {
    setActiveElement(elem);

    selectedShapeRef.current = elem?.value as string;
  }

  useEffect(() => {

    const canvas = initializeFabric( {canvasRef, fabricRef})

    canvas.on("mouse:down", (options) => {

      handleCanvasMouseDown( {
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef
      })


    } )

    window.addEventListener("resize", () => {

      handleResize({ fabricRef })

    })


  },[])






  return (
      <main className = "h-screen overflow-hidden"> 

        <Navbar activeElement={activeElement} handleActiveElement={handleActiveElement}/>
        <section className = "flex h-full flex-row">
          
          <Live canvasRef= {canvasRef}/>
        </section>

      </main>
  );
}