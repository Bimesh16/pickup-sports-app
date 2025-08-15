package com.bmessi.pickupsportsapp.controller;

import com.bmessi.pickupsportsapp.repository.GameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashSet;
import java.util.Set;

@RestController
public class SportsController {

    @Autowired
    private GameRepository gameRepository;

    @GetMapping("/sports")
    public String[] getSports() {
        // Returns an array of unique sports from all games; empty array if no games exist
        Set<String> uniqueSports = new HashSet<>();
        gameRepository.findAll().forEach(game -> uniqueSports.add(game.getSport()));
        return uniqueSports.toArray(new String[0]);
    }
}