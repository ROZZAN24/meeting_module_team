package com.autonoma.erp.controller;

import com.autonoma.erp.model.*;
import com.autonoma.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/hrm")
@CrossOrigin(origins = "*")
public class ClassificationController {

    @Autowired private CategoryMasterRepository categoryRepo;
    @Autowired private LevelMasterRepository levelRepo;


    @GetMapping("/categories")
    public List<CategoryMaster> getCategories() { return categoryRepo.findAll(); }

    @GetMapping("/levels")
    public List<LevelMaster> getLevels() { return levelRepo.findAll(); }


}
