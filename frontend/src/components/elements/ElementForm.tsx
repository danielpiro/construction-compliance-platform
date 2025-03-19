import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Container,
} from "@mui/material";
import { Layer, IsolationCoverage } from "../../services/elementService";

type ElementType = "Wall" | "Ceiling" | "Floor" | "Thermal Bridge";
type OutsideCover = "tiah" | "dry hang" | "wet hang";
type BuildMethod =
  | "blocks"
  | "concrete"
  | "amir wall"
  | "baranovich"
  | "light build";
type BuildMethodIsolation =
  | "no extra cover"
  | "extra cover"
  | "inside isolation"
  | "outside isolation";

const isolationCoverageOptions: IsolationCoverage[] = [
  "dark color",
  "bright color",
];

const outsideCoverOptions: OutsideCover[] = ["tiah", "dry hang", "wet hang"];

const buildMethodOptions: BuildMethod[] = [
  "blocks",
  "concrete",
  "amir wall",
  "baranovich",
  "light build",
];

const buildMethodIsolationMap: Record<BuildMethod, BuildMethodIsolation[]> = {
  blocks: ["no extra cover", "extra cover"],
  concrete: ["inside isolation", "outside isolation"],
  "amir wall": ["outside isolation"],
  baranovich: ["inside isolation"],
  "light build": [],
};

interface SubTypes {
  Wall: ["Outside Wall", "Isolation Wall"];
  Floor: ["Upper Open Space", "Upper Close Room"];
  Ceiling: ["Upper Open Space", "Upper Close Room", "Upper Roof", "Under Roof"];
  "Thermal Bridge": [];
}

export interface ElementFormData {
  name: string;
  type: ElementType;
  subType?: string;
  outsideCover?: OutsideCover;
  buildMethod?: BuildMethod;
  buildMethodIsolation?: BuildMethodIsolation;
  isolationCoverage?: IsolationCoverage;
  layers: Layer[];
}

interface ElementFormProps {
  onSubmit: (data: ElementFormData) => void;
  initialData?: ElementFormData;
}

const elementTypes: ElementType[] = [
  "Wall",
  "Ceiling",
  "Floor",
  "Thermal Bridge",
];

const subTypes: SubTypes = {
  Wall: ["Outside Wall", "Isolation Wall"],
  Floor: ["Upper Open Space", "Upper Close Room"],
  Ceiling: ["Upper Open Space", "Upper Close Room", "Upper Roof", "Under Roof"],
  "Thermal Bridge": [],
};

export const ElementForm: React.FC<ElementFormProps> = ({
  onSubmit,
  initialData,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ElementFormData>(
    initialData || {
      name: "",
      type: "Wall",
      subType: undefined,
      outsideCover: undefined,
      buildMethod: undefined,
      buildMethodIsolation: undefined,
      isolationCoverage: undefined,
      layers: [],
    }
  );

  // Update subType when type changes
  useEffect(() => {
    if (formData.type === "Thermal Bridge") {
      setFormData((prev) => ({ ...prev, subType: undefined }));
    } else {
      setFormData((prev) => ({
        ...prev,
        subType: subTypes[prev.type][0],
      }));
    }
  }, [formData.type]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name || !formData.type) {
      return;
    }
    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
      <Container maxWidth="sm">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h6">{t("elements.form.title")}</Typography>

          <TextField
            required
            label={t("elements.form.name")}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={t("elements.form.namePlaceholder")}
            fullWidth
          />

          <FormControl required fullWidth>
            <InputLabel>{t("elements.form.type")}</InputLabel>
            <Select
              value={formData.type}
              label={t("elements.form.type")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as ElementType,
                })
              }
            >
              {elementTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {t(`elements.types.${type}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {formData.type !== "Thermal Bridge" && (
            <FormControl required fullWidth>
              <InputLabel>{t("elements.form.subType")}</InputLabel>
              <Select
                value={formData.subType}
                label={t("elements.form.subType")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subType: e.target.value,
                  })
                }
              >
                {subTypes[formData.type].map((subType) => (
                  <MenuItem key={subType} value={subType}>
                    {t(`elements.subtypes.${subType}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {formData.type === "Wall" && formData.subType === "Outside Wall" && (
            <>
              <FormControl required fullWidth>
                <InputLabel>{t("elements.form.outsideCover")}</InputLabel>
                <Select
                  value={formData.outsideCover || ""}
                  label={t("elements.form.outsideCover")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      outsideCover: e.target.value as OutsideCover,
                      buildMethod: undefined,
                      buildMethodIsolation: undefined,
                    })
                  }
                >
                  {outsideCoverOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {t(`elements.outsideCover.${option}`)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {formData.outsideCover && (
                <FormControl required fullWidth>
                  <InputLabel>{t("elements.form.buildMethod")}</InputLabel>
                  <Select
                    value={formData.buildMethod || ""}
                    label={t("elements.form.buildMethod")}
                    onChange={(e) => {
                      const method = e.target.value as BuildMethod;
                      const isolationOptions = buildMethodIsolationMap[method];
                      setFormData({
                        ...formData,
                        buildMethod: method,
                        buildMethodIsolation:
                          isolationOptions?.length === 1
                            ? isolationOptions[0]
                            : undefined,
                      });
                    }}
                  >
                    {buildMethodOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {t(`elements.buildMethod.${option}`)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {formData.buildMethod &&
                buildMethodIsolationMap[formData.buildMethod].length > 1 && (
                  <FormControl required fullWidth>
                    <InputLabel>
                      {t("elements.form.buildMethodIsolation")}
                    </InputLabel>
                    <Select
                      value={formData.buildMethodIsolation || ""}
                      label={t("elements.form.buildMethodIsolation")}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          buildMethodIsolation: e.target
                            .value as BuildMethodIsolation,
                        })
                      }
                    >
                      {buildMethodIsolationMap[formData.buildMethod].map(
                        (option) => (
                          <MenuItem key={option} value={option}>
                            {t(`elements.buildMethodIsolation.${option}`)}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>
                )}

              {formData.buildMethod && formData.buildMethodIsolation && (
                <FormControl required fullWidth>
                  <InputLabel>
                    {t("elements.form.isolationCoverage")}
                  </InputLabel>
                  <Select
                    value={formData.isolationCoverage}
                    label={t("elements.form.isolationCoverage")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isolationCoverage: e.target.value as IsolationCoverage,
                      })
                    }
                  >
                    {isolationCoverageOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {t(`elements.isolationCoverage.${option}`)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            fullWidth
          >
            {t("elements.form.submit")}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};
