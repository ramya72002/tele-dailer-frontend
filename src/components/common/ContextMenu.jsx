import React, { useEffect, useRef } from "react";

function ContextMenu({ options, cordinates, contextMenu,setContextMenu}) {
  const contextMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      console.log("sadvfb")
      if (event.target.id !== "context-opener") {
        if (contextMenuRef.current && 
          !contextMenuRef.current.contains(event.target)
        ) {
          setContextMenu(false);
        }
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const handleClick = (e, callback) => {
    e.stopPropagation();
    setContextMenu(false);
    callback();
  };

  if (!cordinates) return null;  // Add a check to return nothing if cordinates are undefined.

  return (
    <div
      className={`bg-dropdown-background fixed py-2 z-[100] shadow-xl`}
      ref={contextMenuRef}
      style={{
        top: cordinates.y || 0, // Ensure that undefined values are safely handled
        left: cordinates.x || 0, // Set default values if cordinates are undefined
      }}
    >
      <ul>
        {options.map(({ name, callback }) => (
          <li
            key={name}
            onClick={(e) => handleClick(e, callback)}
            className="px-5 py-2 cursor-pointer hover:bg-background-default"
          >
            <span className="text-white">{name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ContextMenu;
