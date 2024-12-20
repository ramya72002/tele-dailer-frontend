import React, { useEffect } from "react";
import axios from "axios";
import { GET_INITIAL_CONTACTS_ROUTE } from "@/utils/ApiRoutes";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import ChatLIstItem from "./ChatLIstItem";

function List() {
  const [{ userInfo, userContacts, filteredContacts }, dispatch] = useStateProvider();

  useEffect(() => {
    const getContacts = async () => {
      try {
        const {
          data: { users, onlineUsers },
        } = await axios(`${GET_INITIAL_CONTACTS_ROUTE}/${userInfo.id}`);
        dispatch({type:reducerCases.SET_ONLINE_USERS, onlineUsers});
        dispatch({type:reducerCases.SET_USER_CONTACTS, userContacts:users});

        
        // Dispatch data to state if needed
        // dispatch({ type: "SET_CONTACTS", payload: { users, onlineUsers } });
      } catch (err) {
        console.error(err);
      }
    };
    if (userInfo?.id) {
      getContacts();
    }
  }, [userInfo]);

  return (
    <div className="bg-search-input-container-background flex-auto overflow-auto max-h-full custom-scrollbar">
      {filteredContacts && filteredContacts.length > 0 ? (
        filteredContacts.map((contact) => (
          <ChatLIstItem data={contact} key={contact.id} />
        ))
      ) : userContacts && userContacts.length > 0 ? (
        userContacts.map((contact) => <ChatLIstItem data={contact} key={contact.id} />)
      ) : (
        <div className="text-center text-gray-500 mt-4">No contacts available</div>
      )}
    </div>
  );
}
export default List;
