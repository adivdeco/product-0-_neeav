// In your component
const [isEmailManuallyEdited, setIsEmailManuallyEdited] = useState(false);

// Update the useEffect
useEffect(() => {
    if (!isEmailManuallyEdited && shouldGenerateEmail(watchEmail, selectedCustomer) && watchCustomerName) {
        const generatedEmail = generateCustomerEmail(watchCustomerName, watchPhone);
        setValue('email', generatedEmail);
    }
}, [watchCustomerName, watchPhone, watchEmail, selectedCustomer, setValue, isEmailManuallyEdited]);

// Add regenerate button in email field
<div className="transform transition-transform duration-300 hover:scale-[1.02]">
    <div className="flex justify-between items-center">
        <label htmlFor="email" className={labelClass}>
            Email
            <span className="text-xs text-blue-600 ml-1">(Auto-generated)</span>
        </label>
        {watchEmail && !isEmailManuallyEdited && (
            <button
                type="button"
                onClick={() => {
                    const newEmail = generateCustomerEmail(watchCustomerName, watchPhone);
                    setValue('email', newEmail);
                }}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
            >
                Regenerate
            </button>
        )}
    </div>
    <input
        id="email"
        type="email"
        {...register('email')}
        className={inputClass}
        placeholder="Auto-generated email"
        disabled={selectedCustomer}
        onFocus={() => setIsEmailManuallyEdited(true)}
    />
    {watchEmail && !isEmailManuallyEdited && (
        <p className="text-xs text-green-600 mt-1">
            ✓ Unique email for bill tracking
        </p>
    )}
    {errors.email && <p className={errorClass}>{errors.email.message}</p>}
</div>