import Input from '../ui/Input';

function EmployeeFormFields({ form, onChange, includeAuthFields = false }) {
  return (
    <>
      {includeAuthFields ? (
        <>
          <Input
            label="Username"
            name="username"
            value={form.username}
            onChange={onChange}
            minLength={3}
            maxLength={50}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            minLength={8}
            required
            autoComplete="new-password"
          />
        </>
      ) : null}

      <Input
        label="Employee Code"
        name="employeeCode"
        value={form.employeeCode}
        onChange={onChange}
        required
      />
      <Input
        label="First Name"
        name="firstName"
        value={form.firstName}
        onChange={onChange}
        required
      />
      <Input
        label="Last Name"
        name="lastName"
        value={form.lastName}
        onChange={onChange}
        required
      />
      <Input
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={onChange}
        required
      />
      <Input label="Phone" name="phone" value={form.phone} onChange={onChange} />
      <Input
        label="Department"
        name="department"
        value={form.department}
        onChange={onChange}
      />
      <Input
        label="Designation"
        name="designation"
        value={form.designation}
        onChange={onChange}
      />
      <Input
        label="Date of Joining"
        name="dateOfJoining"
        type="date"
        value={form.dateOfJoining}
        onChange={onChange}
        required
      />
    </>
  );
}

export default EmployeeFormFields;
