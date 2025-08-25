package com.bmessi.pickupsportsapp.model;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class OutboundMessage {
    private String destination; // e.g. /topic/games/{gameId}/chat
    private Object payload;     // your ChatMessageDTO

    public OutboundMessage() { }

    public OutboundMessage(String destination, Object payload) {
        this.destination = destination;
        this.payload = payload;
    }

    public String getDestination() {
        return destination;
    }

    public Object getPayload() {
        return payload;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public void setPayload(Object payload) {
        this.payload = payload;
    }
}
