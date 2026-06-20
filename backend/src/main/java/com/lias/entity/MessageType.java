package com.lias.entity;

public enum MessageType {
    GLOBAL,  // tout le labo
    TEAM,    // membres d'une équipe
    DIRECT,  // message privé
    EVENT    // discussion liée à un événement (privée aux participants)
}
