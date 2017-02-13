package com.sample.maven.exception.validator;

import java.lang.reflect.InvocationTargetException;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.lang3.StringUtils;

public class CheckAtLeastOneNotNullValidator implements ConstraintValidator<CheckAtLeastOneNotNull, Object> {
    private String[] fieldNames;
    private String dependFieldName;
    
    @Override
    public void initialize(final CheckAtLeastOneNotNull annotation) {
        this.fieldNames = annotation.fieldNames();
        dependFieldName = annotation.dependFieldName();
    }
    
    @SuppressWarnings("deprecation")
	@Override
    public boolean isValid(final Object object, final ConstraintValidatorContext ctx) {
        if (object == null)
            return true;
        try {
            for (String fieldName:fieldNames){
                String property = BeanUtils.getProperty(object, fieldName);
                if (StringUtils.isNotBlank(property) && !StringUtils.equalsIgnoreCase("[]", property) ) {
                 	return true;
                }
            }            
            ctx.disableDefaultConstraintViolation();
            ctx.buildConstraintViolationWithTemplate(ctx.getDefaultConstraintMessageTemplate())
             .addNode(dependFieldName).addConstraintViolation();
            
            return false;

        } catch (final NoSuchMethodException ex) {
            throw new RuntimeException(ex);
        } catch (final InvocationTargetException ex) {
            throw new RuntimeException(ex);
        } catch (final IllegalAccessException ex) {
            throw new RuntimeException(ex);
        }
    }

}