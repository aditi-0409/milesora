package com.qveto.milesora.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.qveto.milesora.dto.ActivityResponse;
import com.qveto.milesora.entity.Activity;
import com.qveto.milesora.entity.AppUser;
import com.qveto.milesora.repository.ActivityRepository;

@Service
@Transactional
public class ActivityService {

    private final ActivityRepository activityRepository;

    public ActivityService(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    // Record a real user activity.
    public void recordActivity(
            AppUser user,
            String detail,
            String target) {

        if (user == null || detail == null || target == null) {
            return;
        }

        Activity activity = new Activity();
        activity.setUser(user);
        activity.setDetail(detail);
        activity.setTarget(target);

        activityRepository.save(activity);
    }

    // Retrieve the latest 50 activities.
    @Transactional(readOnly = true)
    public List<ActivityResponse> getRecentActivities() {

        return activityRepository
                .findTop50ByOrderByTimestampDesc()
                .stream()
                .map(activity -> new ActivityResponse(
                        activity.getId(),
                        activity.getUser().getName(),
                        activity.getDetail(),
                        activity.getTarget(),
                        activity.getTimestamp()))
                .toList();
    }
}