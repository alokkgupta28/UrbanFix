package com.urbanfix.config;

import com.urbanfix.entity.Provider;
import com.urbanfix.entity.Review;
import com.urbanfix.entity.ServiceCategory;
import com.urbanfix.entity.User;
import com.urbanfix.entity.UserRole;
import com.urbanfix.entity.enums.AppRole;
import com.urbanfix.repository.BookingRepository;
import com.urbanfix.repository.ProviderRepository;
import com.urbanfix.repository.ReviewRepository;
import com.urbanfix.repository.ServiceCategoryRepository;
import com.urbanfix.repository.UserRepository;
import com.urbanfix.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final ServiceCategoryRepository categoryRepository;
    private final ProviderRepository providerRepository;
    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedAdmin();
        if (userRoleRepository.count() < 10) {
            log.info("Seeding categories, providers, and reviews...");
            seedData();
            log.info("Seed data loaded successfully!");
        }
    }

    private void seedAdmin() {
        if (!userRepository.existsByEmail("admin@urbanfix.com")) {
            User admin = User.builder()
                .email("admin@urbanfix.com")
                .password(passwordEncoder.encode("admin123"))
                .fullName("System Admin")
                .build();
            userRepository.save(admin);

            UserRole adminRole = UserRole.builder()
                .userId(admin.getId())
                .role(AppRole.admin)
                .build();
            userRoleRepository.save(adminRole);
            log.info("Admin user created: admin@urbanfix.com / admin123");
        }
    }

    private void seedData() {
        bookingRepository.deleteAllInBatch();
        reviewRepository.deleteAllInBatch();
        providerRepository.deleteAllInBatch();
        categoryRepository.deleteAllInBatch();

        List<ServiceCategory> categories = List.of(
            createCategory("electrician", "Electrician", "Wiring, repairs & installations", "Certified electricians for switchboards, wiring, fan installation, MCB tripping, and inverter setup.", 299, "electrician", 1),
            createCategory("plumber", "Plumber", "Leak repair, taps & fittings", "Expert plumbers for leakages, tap replacement, drain unclogging, and bathroom fittings.", 249, "plumber", 2),
            createCategory("deep-cleaning", "Deep Cleaning", "Kitchen, bathroom & full home", "Trained cleaners with pro-grade equipment for kitchens, bathrooms and full-home deep cleans.", 1499, "cleaning", 3),
            createCategory("carpenter", "Carpenter", "Furniture repair & assembly", "Skilled carpenters for door repairs, drawer fixing, furniture assembly and modular carpentry.", 399, "carpenter", 4),
            createCategory("painter", "Painter", "Interior & exterior painting", "Professional painters using low-VOC paints for walls, ceilings, and touch-ups.", 3999, "painter", 5),
            createCategory("salon-at-home", "Salon at Home", "Beauty, hair & spa", "Certified beauticians bring salon-quality haircuts, facials, waxing and spa to your door.", 799, "salon", 6),
            createCategory("ro-repair", "RO Repair", "Purifier service & filters", "Genuine spares and RO service by trained technicians. Same-day slots available.", 449, "ro", 7),
            createCategory("ac-repair", "AC Repair", "Service, gas & installation", "AC service, gas top-up, uninstall/reinstall, and deep-clean by certified pros.", 549, "ac", 8),
            createCategory("appliance-repair", "Appliance Repair", "Washing machine, TV & more", "Repair for washing machines, microwaves, refrigerators, chimneys and geysers.", 349, "appliance", 9),
            createCategory("pest-control", "Pest Control", "Cockroach, termite & rodent", "Odourless, child-safe pest control by licensed technicians with 30-day warranty.", 1199, "pest", 10)
        );
        categories = categoryRepository.saveAll(categories);
        
        Map<String, ServiceCategory> catMap = categories.stream().collect(Collectors.toMap(ServiceCategory::getSlug, c -> c));

        List<Provider> providers = List.of(
            createProvider(catMap.get("electrician"), "Rahul Sharma", "Certified Master Electrician", "12 years fixing everything from short circuits to full-home rewiring. ISI-certified tools, punctual to the minute.", "Bengaluru", 450, 12, 4.92, 318, 412, "p1", "[\"English\",\"Hindi\",\"Kannada\"]"),
            createProvider(catMap.get("electrician"), "Anita Deshmukh", "Electrical Engineer, Home Automation", "MSc Electrical. Specialises in smart-home wiring, MCB panels, and inverter installs.", "Pune", 520, 9, 4.88, 204, 271, "p2", "[\"English\",\"Hindi\",\"Marathi\"]"),
            createProvider(catMap.get("plumber"), "Suresh Iyer", "Plumbing Specialist, 8+ years", "Concealed leak detection, geyser fitting, drainage. Same-day service across South Bengaluru.", "Bengaluru", 380, 8, 4.85, 289, 356, "p3", "[\"English\",\"Hindi\",\"Tamil\"]"),
            createProvider(catMap.get("deep-cleaning"), "Meera Nair", "Team Lead, Deep-Clean Crew", "Leads a 3-person team using steam cleaners and pro-grade agents. 500+ homes cleaned.", "Bengaluru", 600, 6, 4.91, 502, 540, "p4", "[\"English\",\"Hindi\",\"Malayalam\"]"),
            createProvider(catMap.get("carpenter"), "Ajay Kumar", "Modular & Custom Carpentry", "Ex-Godrej Interio craftsman. Wardrobes, kitchens, and precision furniture repair.", "Delhi NCR", 420, 15, 4.87, 367, 489, "p5", "[\"English\",\"Hindi\"]"),
            createProvider(catMap.get("painter"), "Ganesh Patil", "Asian Paints Certified Painter", "Low-VOC, textured, and stencil finishes. Uses drop-sheets and finishes on time, always.", "Mumbai", 350, 11, 4.83, 241, 318, "p6", "[\"English\",\"Hindi\",\"Marathi\"]"),
            createProvider(catMap.get("salon-at-home"), "Priya Menon", "Senior Beauty Expert, L'Oréal Certified", "8 years at premium salons. Hair colour, keratin, facials and pre-bridal packages.", "Bengaluru", 700, 8, 4.94, 612, 689, "p7", "[\"English\",\"Hindi\",\"Tamil\"]"),
            createProvider(catMap.get("ro-repair"), "Vikram Singh", "RO & Water Purifier Technician", "Kent, Aquaguard, Livpure factory-trained. Genuine spares only. 30-day service warranty.", "Gurugram", 400, 7, 4.86, 198, 247, "p8", "[\"English\",\"Hindi\",\"Punjabi\"]"),
            createProvider(catMap.get("ac-repair"), "Farhan Qureshi", "Split & Window AC Expert", "Voltas & Daikin certified. Gas top-up with pressure test, deep-clean using foam agents.", "Hyderabad", 500, 10, 4.89, 412, 533, "p9", "[\"English\",\"Hindi\",\"Urdu\"]"),
            createProvider(catMap.get("appliance-repair"), "Deepa Reddy", "Multi-Brand Appliance Repair", "Front-load washers, chimneys, microwaves. LG, Samsung, IFB service history.", "Chennai", 380, 9, 4.82, 284, 341, "p10", "[\"English\",\"Hindi\",\"Telugu\",\"Tamil\"]"),
            createProvider(catMap.get("pest-control"), "Rohit Verma", "Licensed Pest Control Specialist", "ISO-certified. Child-safe, odourless treatments. Cockroach, termite, rodent and mosquito.", "Bengaluru", 450, 6, 4.84, 176, 231, "p11", "[\"English\",\"Hindi\"]"),
            createProvider(catMap.get("plumber"), "Karthik Rao", "Bathroom Fittings Specialist", "Grohe & Jaquar-certified installer. Concealed plumbing, sensor taps, geyser installs.", "Bengaluru", 420, 7, 4.88, 213, 268, "p12", "[\"English\",\"Hindi\",\"Kannada\"]")
        );
        providers = providerRepository.saveAll(providers);

        Map<String, Provider> proMap = providers.stream().collect(Collectors.toMap(Provider::getFullName, p -> p));

        List<Review> reviews = List.of(
            createReview(proMap.get("Rahul Sharma"), "Ananya B.", "Bengaluru", 5, "Rahul diagnosed a tripping MCB issue three other technicians missed. On-time, tidy, and explained everything clearly."),
            createReview(proMap.get("Meera Nair"), "Sanjay P.", "Bengaluru", 5, "Meera's team deep-cleaned our 3BHK in 4 hours. Sofa, kitchen tiles, exhaust — spotless. Absolutely worth it."),
            createReview(proMap.get("Priya Menon"), "Divya K.", "Bengaluru", 5, "Best at-home facial I've had. Priya carried premium products and the setup was more hygienic than most salons."),
            createReview(proMap.get("Farhan Qureshi"), "Rakesh M.", "Hyderabad", 5, "AC that hadn't cooled in weeks — Farhan fixed it in one visit. Professional, transparent pricing."),
            createReview(proMap.get("Suresh Iyer"), "Neha R.", "Bengaluru", 4, "Fixed a hidden pipe leak same evening. Slight delay in arrival but the work was excellent."),
            createReview(proMap.get("Ajay Kumar"), "Ishaan V.", "Delhi NCR", 5, "Assembled two wardrobes and repaired a drawer track. Precise, quiet, and left zero mess.")
        );
        reviewRepository.saveAll(reviews);
    }

    private ServiceCategory createCategory(String slug, String name, String tagline, String desc, int price, String icon, int order) {
        ServiceCategory cat = new ServiceCategory();
        cat.setSlug(slug);
        cat.setName(name);
        cat.setTagline(tagline);
        cat.setDescription(desc);
        cat.setBasePrice(price);
        cat.setIconKey(icon);
        cat.setSortOrder(order);
        return cat;
    }

    private Provider createProvider(ServiceCategory cat, String name, String headline, String bio, String city, int rate, int exp, double rating, int ratingCount, int jobs, String avatar, String languages) {
        String email = name.toLowerCase().replaceAll("[^a-z0-9]", ".") + "@urbanfix.com";
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User u = User.builder()
                .email(email)
                .password(passwordEncoder.encode("provider123"))
                .fullName(name)
                .build();
            u = userRepository.save(u);
            
            UserRole r = UserRole.builder()
                .userId(u.getId())
                .role(AppRole.provider)
                .build();
            userRoleRepository.save(r);
            return u;
        });

        Provider p = new Provider();
        p.setCategory(cat);
        p.setFullName(name);
        p.setHeadline(headline);
        p.setBio(bio);
        p.setCity(city);
        p.setHourlyRate(rate);
        p.setExperienceYears(exp);
        p.setRatingAvg(BigDecimal.valueOf(rating));
        p.setRatingCount(ratingCount);
        p.setJobsCompleted(jobs);
        p.setAvatarKey(avatar);
        p.setLanguages(languages);
        p.setVerified(true);
        p.setUserId(user.getId());
        return p;
    }

    private Review createReview(Provider p, String cName, String cCity, int rating, String comment) {
        Review r = new Review();
        if (p != null) r.setProviderId(p.getId());
        r.setCustomerName(cName);
        r.setCustomerCity(cCity);
        r.setRating(rating);
        r.setComment(comment);
        return r;
    }
}
