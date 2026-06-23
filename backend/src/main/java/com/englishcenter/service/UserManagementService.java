package com.englishcenter.service;

import com.englishcenter.entity.ParentProfile;
import com.englishcenter.entity.StudentParent;
import com.englishcenter.entity.StudentParentId;
import com.englishcenter.entity.StudentProfile;
import com.englishcenter.entity.TeacherProfile;
import com.englishcenter.entity.UserAccount;
import com.englishcenter.exception.NotFoundException;
import com.englishcenter.repository.ParentRepository;
import com.englishcenter.repository.StudentParentRepository;
import com.englishcenter.repository.StudentRepository;
import com.englishcenter.repository.TeacherRepository;
import com.englishcenter.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserManagementService {
    private final UserRepository users;
    private final TeacherRepository teachers;
    private final StudentRepository students;
    private final ParentRepository parents;
    private final StudentParentRepository studentParents;

    public UserManagementService(
            UserRepository users,
            TeacherRepository teachers,
            StudentRepository students,
            ParentRepository parents,
            StudentParentRepository studentParents) {
        this.users = users;
        this.teachers = teachers;
        this.students = students;
        this.parents = parents;
        this.studentParents = studentParents;
    }

    public record TeacherRequest(
            String username,
            String password,
            String fullName,
            String email,
            String phone,
            Boolean active,
            String degree,
            String specialization,
            BigDecimal salaryRate,
            LocalDate joinDate) {
    }

    public record StudentRequest(
            String username,
            String password,
            String fullName,
            String email,
            String phone,
            Boolean active,
            LocalDate dateOfBirth,
            String address,
            LocalDate enrollDate) {
    }

    public record ParentRequest(
            String username,
            String password,
            String fullName,
            String email,
            String phone,
            Boolean active,
            String zaloId,
            String facebookId,
            String relationship) {
    }

    public record LinkParentRequest(Long studentId, Long parentId) {
    }

    public record AdminRequest(
            String username,
            String password,
            String fullName,
            String email,
            String phone,
            Boolean active) {
    }

    public record ChangePasswordRequest(String password) {
    }

    public List<Map<String, Object>> listAdmins() {
        return users.findByRoleOrderByFullNameAsc("ADMIN").stream().map(this::baseMap).toList();
    }

    public List<Map<String, Object>> listTeachers() {
        return users.findByRoleOrderByFullNameAsc("TEACHER").stream().map(this::teacherMap).toList();
    }

    public List<Map<String, Object>> listStudents() {
        return users.findByRoleOrderByFullNameAsc("STUDENT").stream().map(this::studentMap).toList();
    }

    public List<Map<String, Object>> listParents() {
        return users.findByRoleOrderByFullNameAsc("PARENT").stream().map(this::parentMap).toList();
    }

    public Map<String, Object> getProfile(Long id) {
        UserAccount user = users.findById(id).orElseThrow(() -> new NotFoundException("User not found: " + id));
        return switch (user.role) {
            case "TEACHER" -> withoutPassword(teacherMap(user));
            case "STUDENT" -> withoutPassword(studentMap(user));
            case "PARENT" -> withoutPassword(parentMap(user));
            default -> withoutPassword(baseMap(user));
        };
    }

    @Transactional
    public Map<String, Object> createAdmin(AdminRequest request) {
        UserAccount user = createBaseUser(request.username(), request.password(), request.fullName(), request.email(),
                request.phone(), "ADMIN", request.active());
        return baseMap(user);
    }

    @Transactional
    public Map<String, Object> updateAdmin(Long id, AdminRequest request) {
        UserAccount user = requireUser(id, "ADMIN");
        updateBaseUser(user, request.fullName(), request.email(), request.phone(), request.active(),
                request.password());
        return baseMap(user);
    }

    @Transactional
    public Map<String, Object> createTeacher(TeacherRequest request) {
        UserAccount user = createBaseUser(request.username(), request.password(), request.fullName(), request.email(),
                request.phone(), "TEACHER", request.active());
        TeacherProfile profile = new TeacherProfile();
        profile.id = user.id;
        profile.degree = request.degree();
        profile.specialization = request.specialization();
        profile.salaryRate = defaultMoney(request.salaryRate());
        profile.joinDate = request.joinDate();
        teachers.save(profile);
        return teacherMap(user);
    }

    @Transactional
    public Map<String, Object> updateTeacher(Long id, TeacherRequest request) {
        UserAccount user = requireUser(id, "TEACHER");
        updateBaseUser(user, request.fullName(), request.email(), request.phone(), request.active(),
                request.password());
        TeacherProfile profile = teachers.findById(id).orElseGet(() -> {
            TeacherProfile created = new TeacherProfile();
            created.id = id;
            return created;
        });
        profile.degree = request.degree();
        profile.specialization = request.specialization();
        profile.salaryRate = defaultMoney(request.salaryRate());
        profile.joinDate = request.joinDate();
        teachers.save(profile);
        return teacherMap(user);
    }

    @Transactional
    public Map<String, Object> createStudent(StudentRequest request) {
        UserAccount user = createBaseUser(request.username(), request.password(), request.fullName(), request.email(),
                request.phone(), "STUDENT", request.active());
        StudentProfile profile = new StudentProfile();
        profile.id = user.id;
        profile.dateOfBirth = request.dateOfBirth();
        profile.address = request.address();
        profile.enrollDate = request.enrollDate() == null ? LocalDate.now() : request.enrollDate();
        students.save(profile);
        return studentMap(user);
    }

    @Transactional
    public Map<String, Object> updateStudent(Long id, StudentRequest request) {
        UserAccount user = requireUser(id, "STUDENT");
        updateBaseUser(user, request.fullName(), request.email(), request.phone(), request.active(),
                request.password());
        StudentProfile profile = students.findById(id).orElseGet(() -> {
            StudentProfile created = new StudentProfile();
            created.id = id;
            return created;
        });
        profile.dateOfBirth = request.dateOfBirth();
        profile.address = request.address();
        profile.enrollDate = request.enrollDate();
        students.save(profile);
        return studentMap(user);
    }

    @Transactional
    public Map<String, Object> createParent(ParentRequest request) {
        UserAccount user = createBaseUser(request.username(), request.password(), request.fullName(), request.email(),
                request.phone(), "PARENT", request.active());
        ParentProfile profile = new ParentProfile();
        profile.id = user.id;
        profile.zaloId = request.zaloId();
        profile.facebookId = request.facebookId();
        profile.relationship = request.relationship();
        parents.save(profile);
        return parentMap(user);
    }

    @Transactional
    public Map<String, Object> updateParent(Long id, ParentRequest request) {
        UserAccount user = requireUser(id, "PARENT");
        updateBaseUser(user, request.fullName(), request.email(), request.phone(), request.active(),
                request.password());
        ParentProfile profile = parents.findById(id).orElseGet(() -> {
            ParentProfile created = new ParentProfile();
            created.id = id;
            return created;
        });
        profile.zaloId = request.zaloId();
        profile.facebookId = request.facebookId();
        profile.relationship = request.relationship();
        parents.save(profile);
        return parentMap(user);
    }

    @Transactional
    public void softDelete(Long id) {
        UserAccount user = users.findById(id).orElseThrow(() -> new NotFoundException("User not found: " + id));
        user.active = false;
        users.save(user);
    }

    @Transactional
    public void activate(Long id) {
        UserAccount user = users.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found: " + id));
        user.active = true;
        users.save(user);
    }

    @Transactional
    public void hardDelete(Long id) {
        if (!users.existsById(id)) {
            throw new NotFoundException("User not found: " + id);
        }
        // Xoá liên kết phụ huynh-học sinh trước (nếu có)
        studentParents.deleteByIdStudentId(id);
        studentParents.deleteByIdParentId(id);
        // Xoá profile theo role
        teachers.deleteById(id);
        students.deleteById(id);
        parents.deleteById(id);
        // Xoá user
        users.deleteById(id);
    }

    @Transactional
    public void linkParent(LinkParentRequest request) {
        if (request.studentId() == null || request.parentId() == null) {
            throw new IllegalArgumentException("studentId and parentId are required");
        }
        if (!students.existsById(request.studentId())) {
            throw new NotFoundException("Student not found: " + request.studentId());
        }
        if (!parents.existsById(request.parentId())) {
            throw new NotFoundException("Parent not found: " + request.parentId());
        }
        StudentParentId linkId = new StudentParentId(request.studentId(), request.parentId());
        if (studentParents.existsById(linkId)) {
            throw new IllegalArgumentException("Parent is already linked to this student");
        }
        StudentParent link = new StudentParent();
        link.id = linkId;
        studentParents.save(link);
    }

    @Transactional
    public Map<String, Object> changePassword(Long id, ChangePasswordRequest request) {
        if (isBlank(request.password())) {
            throw new IllegalArgumentException("password is required");
        }
        UserAccount user = users.findById(id).orElseThrow(() -> new NotFoundException("User not found: " + id));
        user.passwordHash = request.password().trim();
        users.save(user);
        return baseMap(user);
    }

    private UserAccount createBaseUser(String username, String password, String fullName, String email, String phone,
            String role, Boolean active) {
        if (isBlank(username) || isBlank(fullName)) {
            throw new IllegalArgumentException("username and fullName are required");
        }
        if (users.existsByUsername(username)) {
            throw new IllegalArgumentException("username already exists: " + username);
        }
        UserAccount user = new UserAccount();
        user.username = username.trim();
        user.passwordHash = isBlank(password) ? "ChangeMe123" : password;
        user.fullName = fullName.trim();
        user.email = blankToNull(email);
        user.phone = blankToNull(phone);
        user.role = role;
        user.active = active == null || active;
        return users.save(user);
    }

    private void updateBaseUser(UserAccount user, String fullName, String email, String phone, Boolean active,
            String password) {
        if (!isBlank(fullName)) {
            user.fullName = fullName.trim();
        }
        user.email = blankToNull(email);
        user.phone = blankToNull(phone);
        if (active != null) {
            user.active = active;
        }
        if (!isBlank(password)) {
            user.passwordHash = password;
        }
        users.save(user);
    }

    private UserAccount requireUser(Long id, String role) {
        UserAccount user = users.findById(id).orElseThrow(() -> new NotFoundException(role + " not found: " + id));
        if (!role.equals(user.role)) {
            throw new IllegalArgumentException("User " + id + " is not a " + role);
        }
        return user;
    }

    private Map<String, Object> teacherMap(UserAccount user) {
        TeacherProfile profile = teachers.findById(user.id).orElse(null);
        Map<String, Object> map = baseMap(user);
        map.put("degree", profile == null ? null : profile.degree);
        map.put("specialization", profile == null ? null : profile.specialization);
        map.put("salaryRate", profile == null ? BigDecimal.ZERO : profile.salaryRate);
        map.put("joinDate", profile == null ? null : profile.joinDate);
        return map;
    }

    private Map<String, Object> studentMap(UserAccount user) {
        StudentProfile profile = students.findById(user.id).orElse(null);
        Map<String, Object> map = baseMap(user);
        map.put("dateOfBirth", profile == null ? null : profile.dateOfBirth);
        map.put("address", profile == null ? null : profile.address);
        map.put("enrollDate", profile == null ? null : profile.enrollDate);
        return map;
    }

private Map<String, Object> parentMap(UserAccount user) {
    ParentProfile profile = parents.findById(user.id).orElse(null);
    Map<String, Object> map = baseMap(user);
    map.put("zaloId", profile == null ? null : profile.zaloId);
    map.put("facebookId", profile == null ? null : profile.facebookId);
    map.put("relationship", profile == null ? null : profile.relationship);
    
    // ── CẬP NHẬT ĐOẠN NÀY ĐỂ LẤY TÊN THAY VÌ ID ─────────────────────────
    List<String> studentNames = studentParents.findByIdParentId(user.id).stream()
        .map(link -> {
            Long studentId = link.id.studentId;
            return users.findById(studentId)
                    .map(u -> u.fullName) // Hãy chắc chắn u.fullName trùng với trường họ tên trong UserAccount
                    .orElse("Học sinh không tồn tại");
        })
        .toList();
        
    // Đẩy mảng tên học sinh vào map với key mới là "studentNames"
    map.put("studentNames", studentNames);
    
    return map;
}

    private Map<String, Object> withoutPassword(Map<String, Object> map) {
        map.remove("password");
        return map;
    }

    private Map<String, Object> baseMap(UserAccount user) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", user.id);
        map.put("username", user.username);
        map.put("password", user.passwordHash);
        map.put("fullName", user.fullName);
        map.put("email", user.email);
        map.put("phone", user.phone);
        map.put("role", user.role);
        map.put("active", user.active);
        map.put("createdAt", user.createdAt);
        map.put("updatedAt", user.updatedAt);
        return map;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String blankToNull(String value) {
        return isBlank(value) ? null : value.trim();
    }

    private BigDecimal defaultMoney(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
