package com.taskora.milesora.controller;
import com.taskora.milesora.model.*;import com.taskora.milesora.repo.*;import org.springframework.web.bind.annotation.*;import org.springframework.http.*;import org.springframework.web.multipart.MultipartFile;import java.util.*;import java.time.*;import java.nio.file.*;import java.util.concurrent.ConcurrentHashMap;
@RestController @RequestMapping({"/api", "/api/api"}) public class ApiController {
 private final UserRepository users;private final ProjectRepository projects;private final TaskRepository tasks;private final CommentRepository comments;private final TimeEntryRepository times;private final NotificationRepository notifications;private final DiscussionRepository discussions;private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;private final Map<String,Long> tokens=new ConcurrentHashMap<>();
 public ApiController(UserRepository u,ProjectRepository p,TaskRepository t,CommentRepository c,TimeEntryRepository te,NotificationRepository n,DiscussionRepository d,org.springframework.security.crypto.password.PasswordEncoder pe){users=u;projects=p;tasks=t;comments=c;times=te;notifications=n;discussions=d;passwordEncoder=pe;}
 private Map<String,Object> userMap(UserEntity u){Map<String,Object> m=new LinkedHashMap<>();m.put("id",u.id);m.put("name",u.name);m.put("email",u.email);m.put("username",u.username);m.put("role",u.role);m.put("title",u.title);m.put("avatar",u.avatar);m.put("createdAt",u.createdAt);return m;}
 private UserEntity current(String auth){if(auth==null)return users.findByUsername("admin").orElse(null);String token=auth.replaceFirst("(?i)^Bearer ","");Long id=tokens.get(token);return id==null?users.findByUsername("admin").orElse(null):users.findById(id).orElse(null);}
 @GetMapping("/test") public Map<String,Object> test(){return Map.of("success",true,"message","Milesora backend connected","service","Taskora Pulse API");}
 @PostMapping("/auth/login") public ResponseEntity<?> login(@RequestBody Map<String,Object> b){String e=String.valueOf(b.getOrDefault("email",""));String pw=String.valueOf(b.getOrDefault("password",""));UserEntity u=users.findByEmail(e).or(()->users.findByUsername(e)).orElse(null);if(u==null||!(Objects.equals(u.password,pw)||passwordEncoder.matches(pw,u.password)))return ResponseEntity.status(401).body(Map.of("status",401,"error","Unauthorized","message","Invalid email/username or password"));if(!u.password.startsWith("$2a$")&&!u.password.startsWith("$2b$")&&!u.password.startsWith("$2y$")){u.password=passwordEncoder.encode(pw);users.save(u);}String token=UUID.randomUUID().toString();tokens.put(token,u.id);return ResponseEntity.ok(Map.of("token",token,"type","Bearer","user",userMap(u)));}

@PostMapping("/auth/register")
public ResponseEntity<?> register(@RequestBody Map<String, Object> b) {

    String email = Objects.toString(b.get("email"), "").trim();
    String password = Objects.toString(b.get("password"), "");
    String firstName = Objects.toString(b.get("firstName"), "").trim();
    String middleName = Objects.toString(b.get("middleName"), "").trim();
    String lastName = Objects.toString(b.get("lastName"), "").trim();

    String name = Objects.toString(
        b.get("name"),
        (firstName + " " + middleName + " " + lastName).trim()
    );

    if (email.isBlank() || password.isBlank()
            || firstName.isBlank() || lastName.isBlank()) {
        return ResponseEntity.badRequest().body(
            Map.of("message", "First name, last name, email and password are required")
        );
    }

    if (users.existsByEmail(email)) {
        return ResponseEntity.status(409).body(
            Map.of("message", "Email already registered")
        );
    }

    UserEntity u = new UserEntity();

    u.email = email;
    u.username = email;
    u.password = passwordEncoder.encode(password);
    u.name = name;

    u.firstName = firstName;
    u.middleName = middleName.isBlank() ? null : middleName;
    u.lastName = lastName;

    u.phone = Objects.toString(b.get("phone"), "");
    u.department = Objects.toString(b.get("department"), "");
    u.title = Objects.toString(b.get("title"), "Team Member");

    String dobValue = Objects.toString(b.get("dob"), "");
    if (!dobValue.isBlank()) {
        u.dob = LocalDate.parse(dobValue);
    }

    // Public registration must not allow self-assigned admin privileges.
    u.role = "EMPLOYEE";

    users.save(u);

    String token = UUID.randomUUID().toString();
    tokens.put(token, u.id);

    return ResponseEntity.status(201).body(
        Map.of(
            "token", token,
            "type", "Bearer",
            "user", userMap(u)
        )
    );
}

 @GetMapping("/auth/me") public Object me(@RequestHeader(value="Authorization",required=false)String a){return userMap(current(a));}
 @PostMapping("/auth/logout") public Map<String,Object> logout(@RequestHeader(value="Authorization",required=false)String a){if(a!=null)tokens.remove(a.replaceFirst("(?i)^Bearer ",""));return Map.of("success",true);}
 @GetMapping("/team") public List<Map<String,Object>> team(){return users.findAll().stream().map(u->{Map<String,Object>m=userMap(u);long assigned=tasks.findAll().stream().filter(t->Objects.equals(t.assigneeId,u.id)).count();m.put("assignedTasks",assigned);m.put("completedTasks",tasks.findAll().stream().filter(t->Objects.equals(t.assigneeId,u.id)&&"COMPLETED".equals(t.status)).count());m.put("overdueTasks",0);m.put("activeWorkload",assigned>4?"OVERLOADED":"OPTIMAL");m.put("activeProjects",projects.findAll().stream().map(p->p.name).toList());return m;}).toList();}
 @PutMapping("/users/{id}") public Object updateUser(@PathVariable Long id,@RequestBody Map<String,Object>b){UserEntity u=users.findById(id).orElseThrow();if(b.containsKey("name"))u.name=""+b.get("name");if(b.containsKey("title"))u.title=""+b.get("title");if(b.containsKey("email"))u.email=""+b.get("email");return userMap(users.save(u));}
 @GetMapping("/projects") public List<Map<String,Object>> allProjects(){return projects.findAll().stream().map(this::projectMap).toList();}
 private Map<String,Object> projectMap(ProjectEntity p){Map<String,Object>m=new LinkedHashMap<>();m.put("id",p.id);m.put("name",p.name);m.put("key",p.keyCode==null?"PRJ-"+p.id:p.keyCode);m.put("description",p.description);m.put("status",p.status);m.put("priority",p.priority);m.put("startDate",p.startDate);m.put("dueDate",p.dueDate);m.put("managerId",p.managerId);UserEntity u=p.managerId==null?null:users.findById(p.managerId).orElse(null);m.put("manager",u==null?null:Map.of("id",u.id,"name",u.name,"avatar",u.avatar==null?"":u.avatar));List<TaskEntity>ts=tasks.findByProjectId(p.id);long done=ts.stream().filter(t->"COMPLETED".equals(t.status)).count();long prog=ts.stream().filter(t->"IN_PROGRESS".equals(t.status)).count();m.put("memberCount",users.count());m.put("taskStats",Map.of("total",ts.size(),"completed",done,"inProgress",prog,"toDo",ts.size()-done-prog,"progressPercentage",ts.isEmpty()?0:(int)(done*100/ts.size())));m.put("riskLevel","LOW");m.put("createdAt",p.createdAt);return m;}
 @GetMapping("/projects/{id}") public Object project(@PathVariable Long id){return projectMap(projects.findById(id).orElseThrow());}
 @PostMapping("/projects") public ResponseEntity<?> createProject(@RequestBody Map<String,Object>b){ProjectEntity p=new ProjectEntity();fillProject(p,b);p=projects.save(p);return ResponseEntity.status(201).body(projectMap(p));}
 @PutMapping("/projects/{id}") public Object updateProject(@PathVariable Long id,@RequestBody Map<String,Object>b){ProjectEntity p=projects.findById(id).orElseThrow();fillProject(p,b);return projectMap(projects.save(p));}
 private void fillProject(ProjectEntity p,Map<String,Object>b){if(b.containsKey("name"))p.name=""+b.get("name");if(p.name==null||p.name.isBlank())p.name="Untitled Project";if(b.containsKey("description"))p.description=Objects.toString(b.get("description"),"");if(b.containsKey("status"))p.status=""+b.get("status");if(b.containsKey("priority"))p.priority=""+b.get("priority");if(b.containsKey("key"))p.keyCode=""+b.get("key");if(b.containsKey("managerId"))p.managerId=longVal(b.get("managerId"));p.startDate=dateVal(b.get("startDate"));p.dueDate=dateVal(b.get("dueDate"));}
 @DeleteMapping("/projects/{id}") public ResponseEntity<Void> deleteProject(@PathVariable Long id){projects.deleteById(id);return ResponseEntity.noContent().build();}
 @GetMapping("/tasks") public List<Map<String,Object>> allTasks(@RequestParam(required=false)Long projectId,@RequestParam(required=false)Long assigneeId,@RequestParam(required=false)String status,@RequestParam(required=false)String priority,@RequestParam(required=false)String search){return tasks.findAll().stream().filter(t->projectId==null||Objects.equals(projectId,t.projectId)).filter(t->assigneeId==null||Objects.equals(assigneeId,t.assigneeId)).filter(t->status==null||status.equals(t.status)).filter(t->priority==null||priority.equals(t.priority)).filter(t->search==null||((t.title+" "+Objects.toString(t.description,"")).toLowerCase().contains(search.toLowerCase()))).map(this::taskMap).toList();}
 private Map<String,Object> taskMap(TaskEntity t){Map<String,Object>m=new LinkedHashMap<>();m.put("id",t.id);m.put("taskCode","TSK-"+t.id);m.put("title",t.title);m.put("description",t.description);m.put("status",t.status);m.put("priority",t.priority);m.put("projectId",t.projectId);ProjectEntity p=t.projectId==null?null:projects.findById(t.projectId).orElse(null);m.put("projectName",p==null?"Unassigned":p.name);m.put("assigneeId",t.assigneeId);UserEntity u=t.assigneeId==null?null:users.findById(t.assigneeId).orElse(null);m.put("assignee",u==null?null:userMap(u));m.put("startDate",t.startDate);m.put("dueDate",t.dueDate);m.put("estimatedHours",t.estimatedHours);m.put("spentHours",t.spentHours);m.put("dependencyIds",List.of());m.put("dependencyTitles",List.of());m.put("hasIncompleteDependencies",false);m.put("commentsCount",comments.findByTaskIdOrderByCreatedAtDesc(t.id).size());m.put("attachmentsCount",0);m.put("createdAt",t.createdAt);return m;}
 @PostMapping("/tasks") public ResponseEntity<?> createTask(@RequestBody Map<String,Object>b){TaskEntity t=new TaskEntity();fillTask(t,b);t=tasks.save(t);return ResponseEntity.status(201).body(taskMap(t));}
 @PutMapping("/tasks/{id}") public Object updateTask(@PathVariable Long id,@RequestBody Map<String,Object>b){TaskEntity t=tasks.findById(id).orElseThrow();fillTask(t,b);return taskMap(tasks.save(t));}
 @PatchMapping("/tasks/{id}/status") public Object status(@PathVariable Long id,@RequestBody Map<String,Object>b){TaskEntity t=tasks.findById(id).orElseThrow();t.status=String.valueOf(b.getOrDefault("status",t.status));return taskMap(tasks.save(t));}
 private void fillTask(TaskEntity t,Map<String,Object>b){if(b.containsKey("title"))t.title=""+b.get("title");if(t.title==null||t.title.isBlank())t.title="Untitled Task";if(b.containsKey("description"))t.description=Objects.toString(b.get("description"),"");if(b.containsKey("status"))t.status=""+b.get("status");if(b.containsKey("priority"))t.priority=""+b.get("priority");if(b.containsKey("projectId"))t.projectId=longVal(b.get("projectId"));if(b.containsKey("assigneeId"))t.assigneeId=longVal(b.get("assigneeId"));if(b.containsKey("estimatedHours"))t.estimatedHours=(int)numVal(b.get("estimatedHours"));if(b.containsKey("spentHours"))t.spentHours=numVal(b.get("spentHours"));t.dueDate=dateVal(b.get("dueDate"));t.startDate=dateVal(b.get("startDate"));}
 @DeleteMapping("/tasks/{id}") public ResponseEntity<Void> deleteTask(@PathVariable Long id){tasks.deleteById(id);return ResponseEntity.noContent().build();}
 @GetMapping("/tasks/{id}/comments") public List<CommentEntity> comments(@PathVariable Long id){return comments.findByTaskIdOrderByCreatedAtDesc(id);}
 @PostMapping("/tasks/{id}/comments") public Object addComment(@PathVariable Long id,@RequestBody Map<String,Object>b,@RequestHeader(value="Authorization",required=false)String a){CommentEntity c=new CommentEntity();c.taskId=id;c.content=String.valueOf(b.getOrDefault("content",""));UserEntity u=current(a);c.authorId=u==null?null:u.id;c.authorName=u==null?"Team Member":u.name;return comments.save(c);}
 @GetMapping("/tasks/{id}/attachments") public List<Object> attachments(@PathVariable Long id){return List.of();}
 @PostMapping("/tasks/{id}/attachments") public Object upload(@PathVariable Long id,@RequestParam("file")MultipartFile f)throws Exception{Path dir=Paths.get("uploads");Files.createDirectories(dir);String name=UUID.randomUUID()+"_"+Path.of(Objects.requireNonNullElse(f.getOriginalFilename(),"file")).getFileName();Files.copy(f.getInputStream(),dir.resolve(name),StandardCopyOption.REPLACE_EXISTING);return Map.of("id",name,"taskId",id,"fileName",f.getOriginalFilename(),"size",f.getSize(),"createdAt",LocalDateTime.now());}
 @GetMapping("/tasks/{id}/time-entries") public List<TimeEntryEntity> timeEntries(@PathVariable Long id){return times.findByTaskId(id);}
 @PostMapping("/tasks/{id}/time-entries") public Object logTime(@PathVariable Long id,@RequestBody Map<String,Object>b,@RequestHeader(value="Authorization",required=false)String a){TimeEntryEntity t=new TimeEntryEntity();t.taskId=id;t.hours=numVal(b.get("hours"));t.description=Objects.toString(b.get("description"),"");t.date=dateVal(b.get("date"));UserEntity u=current(a);t.userId=u==null?null:u.id;TimeEntryEntity saved=times.save(t);TaskEntity task=tasks.findById(id).orElse(null);if(task!=null)task.spentHours=Objects.requireNonNullElse(task.spentHours,0.0)+saved.hours; if(task!=null)tasks.save(task);return saved;}
 @GetMapping("/dashboard/stats") public Map<String,Object> stats(){List<ProjectEntity>ps=projects.findAll();List<TaskEntity>ts=tasks.findAll();long done=ts.stream().filter(t->"COMPLETED".equals(t.status)).count();long progress=ts.stream().filter(t->"IN_PROGRESS".equals(t.status)).count();long active=ps.stream().filter(p->"ACTIVE".equals(p.status)).count();Map<String,Object> m=new LinkedHashMap<>();m.put("totalUsers",users.count());m.put("totalProjects",ps.size());m.put("activeProjects",active);m.put("completedProjects",ps.stream().filter(p->"COMPLETED".equals(p.status)).count());m.put("totalTasks",ts.size());m.put("completedTasks",done);m.put("inProgressTasks",progress);m.put("inReviewTasks",ts.stream().filter(t->"IN_REVIEW".equals(t.status)).count());m.put("toDoTasks",ts.stream().filter(t->"TO_DO".equals(t.status)).count());m.put("overdueTasks",List.of());m.put("overdueCount",0);m.put("tasksDueToday",List.of());m.put("tasksDueTodayCount",0);m.put("blockedTasks",List.of());m.put("blockedCount",0);m.put("overallCompletionRate",ts.isEmpty()?0:done*100/ts.size());m.put("teamHealthScore",85);m.put("healthStatus","HEALTHY");m.put("recentActivity",List.of());m.put("myAssignedCount",0);m.put("myActiveTasks",List.of());m.put("myCompletedCount",0);m.put("myOverdueCount",0);m.put("myOverdueTasks",List.of());m.put("managedProjects",ps.size());return m;}
 @GetMapping("/insights/global") public Map<String,Object> globalInsights(){return Map.of("healthScore",85,"healthStatus","HEALTHY","riskDistribution",Map.of("critical",0,"high",0,"medium",0,"low",tasks.count()),"atRiskTasks",List.of(),"teamWorkloadWarnings",List.of());}
 @GetMapping("/insights/projects/{id}") public Map<String,Object> projectInsights(@PathVariable Long id){ProjectEntity p=projects.findById(id).orElseThrow();return Map.of("projectId",id,"projectName",p.name,"healthScore",85,"healthStatus","HEALTHY","riskDistribution",Map.of("critical",0,"high",0,"medium",0,"low",tasks.findByProjectId(id).size()),"atRiskTasks",List.of(),"teamWorkloadWarnings",List.of());}
 @GetMapping("/notifications") public List<NotificationEntity> allNotifications(@RequestHeader(value="Authorization",required=false)String a){UserEntity u=current(a);return notifications.findByUserIdOrderByCreatedAtDesc(u==null?1L:u.id);}
 @PatchMapping("/notifications/{id}/read") public Object readNotification(@PathVariable Long id){NotificationEntity n=notifications.findById(id).orElseThrow();n.readFlag=true;return notifications.save(n);}
 @PatchMapping("/notifications/read-all") public Map<String,Object> readAll(@RequestHeader(value="Authorization",required=false)String a){UserEntity u=current(a);if(u!=null)notifications.findByUserIdOrderByCreatedAtDesc(u.id).forEach(n->{n.readFlag=true;notifications.save(n);});return Map.of("success",true);}
 @GetMapping("/collaboration/activity") public List<Object> activity(){return List.of();}
 @GetMapping("/collaboration/discussions") public List<DiscussionEntity> allDiscussions(){return discussions.findAll();}
 @PostMapping("/collaboration/discussions") public Object createDiscussion(@RequestBody Map<String,Object>b,@RequestHeader(value="Authorization",required=false)String a){DiscussionEntity d=new DiscussionEntity();d.title=Objects.toString(b.getOrDefault("title","Untitled discussion"));d.content=Objects.toString(b.getOrDefault("content",""));d.category=Objects.toString(b.getOrDefault("category","General"));UserEntity u=current(a);d.authorId=u==null?null:u.id;d.authorName=u==null?"Team Member":u.name;return discussions.save(d);}
 private Long longVal(Object o){try{return o==null?null:Long.valueOf(o.toString());}catch(Exception e){return null;}}private double numVal(Object o){try{return o==null?0:Double.parseDouble(o.toString());}catch(Exception e){return 0;}}private LocalDate dateVal(Object o){try{return o==null||o.toString().isBlank()?null:LocalDate.parse(o.toString());}catch(Exception e){return null;}}
}
