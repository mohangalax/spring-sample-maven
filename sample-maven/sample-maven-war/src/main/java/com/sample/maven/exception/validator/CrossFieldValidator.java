package com.sample.maven.exception.validator;

import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.lang3.StringUtils;

import java.lang.reflect.InvocationTargetException;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;


public class CrossFieldValidator implements ConstraintValidator<CrossField, Object> {
    private String fieldName;
    private String expectedFieldValue;
    private String dependFieldName;

    @Override
    public void initialize(final CrossField annotation) {
        fieldName = annotation.fieldName();
        expectedFieldValue = annotation.fieldValue();
        dependFieldName = annotation.dependFieldName();
    }

    @SuppressWarnings("deprecation")
    @Override
    public boolean isValid(final Object value,
        final ConstraintValidatorContext ctx) {
        if (value == null) {
            return true;
        }

        try {
            final String fieldValue = BeanUtils.getProperty(value, fieldName);
            final String dependFieldValue = BeanUtils.getProperty(value,
                    dependFieldName);

            if (StringUtils.equalsIgnoreCase(expectedFieldValue, fieldValue) &&
                    (StringUtils.isBlank(dependFieldValue) || StringUtils.equalsIgnoreCase("[]", dependFieldValue))) {
                ctx.disableDefaultConstraintViolation();
                ctx.buildConstraintViolationWithTemplate(ctx.getDefaultConstraintMessageTemplate())
                   .addNode(dependFieldName).addConstraintViolation();

                return false;
            }
        } catch (final NoSuchMethodException ex) {
            throw new RuntimeException(ex);
        } catch (final InvocationTargetException ex) {
            throw new RuntimeException(ex);
        } catch (final IllegalAccessException ex) {
            throw new RuntimeException(ex);
        }

        return true;
    }
}
