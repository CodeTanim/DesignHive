import {useBroadcastEvent, useMyPresence, useOthers, useEventListener } from "@liveblocks/react";
import LiveCursors from "./cursor/LiveCursors";
import React, { useCallback, useEffect, useState } from "react";
import CursorChat from "./cursor/CursorChat";
import { CursorMode, Reaction, ReactionEvent } from "@/types/type";
import { CursorState } from "@/types/type" ;
import ReactionSelector from "./reaction/ReactionButton";
import FlyingReaction from "./reaction/FlyingReaction";
import useInterval from "@/hooks/useInterval";

type Props = {
  canvasRef:React.MutableRefObject<HTMLCanvasElement | null>;
}
const Live = ({canvasRef}: Props) => {
  const others = useOthers();
  const [{ cursor }, updateMyPresence] = useMyPresence() as any;

  const [cursorState, setCursorState] = useState<CursorState>( {
    mode: CursorMode.Hidden, 
  })

  const [reaction, setReaction] = useState<Reaction[]>
  ([])

  const broadcast = useBroadcastEvent();

  // Remove reactions that are not visible anymore (every 1 sec)
  useInterval(() => {
    setReaction((reactions) => reactions.filter((reaction) => reaction.timestamp > Date.now() - 4000));
  }, 1000);

  // Broadcast the reaction to other users (every 100ms)
  useInterval(() => {
    if (cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor) {
      // concat all the reactions created on mouse click
      setReaction((reactions) =>
        reactions.concat([
          {
            point: { x: cursor.x, y: cursor.y },
            value: cursorState.reaction,
            timestamp: Date.now(),
          },
        ])
      );

      // Broadcast the reaction to other users
      broadcast({
        x: cursor.x,
        y: cursor.y,
        value: cursorState.reaction,
      });
    }
  }, 100);

    /**
   * useEventListener is used to listen to events broadcasted by other
   * users.
   *
   * useEventListener: https://liveblocks.io/docs/api-reference/liveblocks-react#useEventListener
   */
    useEventListener((eventData) => {
        const event = eventData.event as ReactionEvent;
        setReaction((reactions) =>
          reactions.concat([
            {
              point: { x: event.x, y: event.y },
              value: event.value,
              timestamp: Date.now(),
            },
          ])
        );
    });
  




  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    event.preventDefault();


    if(cursor == null || cursorState.mode !== CursorMode.ReactionSelector) {
        const x = event.clientX-event.currentTarget.getBoundingClientRect().x;

        const y = event.clientY-event.currentTarget.getBoundingClientRect().y;

        updateMyPresence( {cursor: {x, y} } );
    }
  }, [])




  const handlePointerLeave = useCallback((event: React.PointerEvent) => {

    setCursorState( {mode: CursorMode.Hidden})


    updateMyPresence( {cursor: null, message: null} );

  }, [])




  // Show the cursor when the mouse enters the canvas
  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      // get the cursor position in the canvas
      const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

      updateMyPresence({
        cursor: {
          x,
          y,
        },
      });

      // if cursor is in reaction mode, set isPressed to true
      setCursorState((state: CursorState) =>
        cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: true } : state
      );
    },
    [cursorState.mode, setCursorState]
  );






  // hide the cursor when the mouse is up
  const handlePointerUp = useCallback(() => {
    setCursorState((state: CursorState) =>
      cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: false } : state
    );
  }, [cursorState.mode, setCursorState]);





  // Listen to keyboard events to change the cursor state
  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "/") {
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        });
      } else if (e.key === "Escape") {
        updateMyPresence({ message: "" });
        setCursorState({ mode: CursorMode.Hidden });
      } else if (e.key === "e") {
        setCursorState({ mode: CursorMode.ReactionSelector });
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
      }
    };

    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [updateMyPresence]);

  const setReactions = useCallback((reaction:string) =>
    {
        setCursorState({mode: CursorMode.Reaction, reaction, isPressed: false})
    }, [])



  return (
    <div 
        id = "canvas"
        onPointerMove = {handlePointerMove}
        onPointerLeave = {handlePointerLeave}
        onPointerDown = {handlePointerDown}
        onPointerUp = {handlePointerUp}
        className = "h-[100vh] w-full flex justify-center items-center text-center border-2 border-green-500"
       
    >
        <canvas ref = {canvasRef}/>

        {reaction.map ((r ) => (

            <FlyingReaction 
                key = {r.timestamp.toString()} 
                x = {r.point.x}
                y = {r.point.y}
                timestamp={r.timestamp}
                value = {r.value}
            
            />
        )
    
        )}
        {cursor && (
            <CursorChat
                cursor ={cursor}
                cursorState = {cursorState}
                setCursorState = {setCursorState}
                updateMyPresence = {updateMyPresence}

            />
        )}
        
        {/* If cursor is in reaction selector mode, show the reaction selector */}
        {cursorState.mode === CursorMode.ReactionSelector && (
          <ReactionSelector
            setReaction={setReactions}
          />
        )}

        <LiveCursors others= {others} />
    </div>
  )
}

export default Live